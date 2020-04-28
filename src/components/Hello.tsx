import * as React from 'react';
// import React from 'react';
import './Hello.css';
import TransactionViewElement from '../containers/TransactionView';
import CategoryViewElement from '../containers/CategoryView';
import { Props } from './Props';

import TreeView from 'devextreme-react/tree-view';
import CustomStore from 'devextreme/data/custom_store';
import * as http from 'http';
import BusinessViewElement from '../containers/BusinessView';
import CONFIG from '../config';
import SpendingsViewElement from '../containers/SpendingsView';
import AccountsViewElement from '../containers/AccountsView';
// import { inspect } from 'util';
import LoginElement from '../containers/LoginContainer';
import { getStore } from '..';
import { loginRequested } from '../actions';

export enum TreeMenuItemType {
  Transactions,
  Accounts,
  Categories,
  SubCategories,
  Businesses,
  Spendings,
}

export interface MainMenyItem {
  // id: string;
  text: string;
  expanded: boolean;
  element: TreeMenuItemType;
  items?: any[];
}

const categoriesMenuItem = {
  // id: '2',
  text: 'Categories',
  expanded: false,
  element: TreeMenuItemType.Categories,
  items: [],
};

const businessesMenuItem = {
  // id: '3',
  text: 'Businesses',
  expanded: false,
  element: TreeMenuItemType.Businesses,
  items: [],
};

const spendingsMenuItem = {
  // id: '2',
  text: 'Spendings',
  expanded: false,
  element: TreeMenuItemType.Spendings,
  items: [],
};

const accountsMenuItem = {
  // id: '2',
  text: 'Accounts',
  expanded: false,
  element: TreeMenuItemType.Accounts,
  items: [],
};

export const menuItemsSource: MainMenyItem[] = [
  spendingsMenuItem,
  {
    // id: '1',
    text: 'Transactions',
    expanded: false,
    element: TreeMenuItemType.Transactions,
  },
  categoriesMenuItem,
  accountsMenuItem,
  businessesMenuItem,
];

interface category {
  caption: string;
  categoryId: string;
  parentCategoryId: string;
  addedToTree?: boolean;
}

function topLevelCategoriesNodes(
  cats: category[]
): {
  text: string;
  expanded: boolean;
  element: TreeMenuItemType;
  items?: any[];
}[] {
  return cats
    .filter((c) => c.parentCategoryId === undefined)
    .map((c) => {
      return {
        text: c.caption,
        expanded: false,
        element: TreeMenuItemType.SubCategories,
      };
    });
}

const categoriesReadDataSource = (userId?: string) => {
  return {
    store: new CustomStore({
      load: function (loadOptions) {
        const reqBody = {
          action: 'read',
          args: userId
            ? {
                userId,
              }
            : {},
        };
        const bodyString = JSON.stringify(reqBody);

        const options = {
          method: 'POST',
          hostname: CONFIG.serviceUrl,
          port: CONFIG.port,
          path: '/categories',
          headers: {
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(bodyString),
          },
        };

        // console.log(`request options: ${JSON.stringify(options, null, 4)}`);

        return new Promise((resolve, reject) => {
          const req = http.request(options, (res) => {
            let buffer: Buffer;
            res.on('data', (chunk: Buffer) => {
              if (!buffer) {
                buffer = chunk;
              } else {
                buffer = Buffer.concat([buffer, chunk]);
              }
            });

            res.on('end', () => {
              // console.info(`Response: ${buffer}`);
              const data = JSON.parse(buffer.toString());
              const topLevel = topLevelCategoriesNodes(data.payload.categories);
              // console.log(JSON.stringify(topLevel, null, 4));
              resolve(topLevel);
            });
          });

          req.on('error', (err) => {
            console.error(`Error: ${err.message || err}`);
            reject(err);
          });

          // console.log(`Posting request: ${bodyString}`);
          req.write(bodyString);
          req.end();
        });
      },
      key: 'categoryId',
    }),
  };
};

interface MainMenuState {
  selectedMenuItem: MainMenyItem;
  userId?: number;
}

export class Hello extends React.Component<Props, MainMenuState> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedMenuItem: menuItemsSource[0],
    };

    this.handleTreeViewSelectionChange = this.handleTreeViewSelectionChange.bind(this);
    this.renderTreeContent = this.renderTreeContent.bind(this);
  }

  customStore: {
    store: CustomStore;
  };

  render() {
    // console.log(`Rendering... state: ${JSON.stringify(this.state, null, 4)}`);
    if (this.props && this.props.userId) {
      const userId = this.props.userId;
      if (!this.customStore) {
        this.customStore = {
          store: new CustomStore({
            load: function (loadOptions) {
              const categoriesStore = categoriesReadDataSource(userId);
              return categoriesStore.store.load().then((items) => {
                categoriesMenuItem.items = items;
                return menuItemsSource;
              });
            },
          }),
        };
      }
    }

    return (
      <div>
        {this.props.sessionData && this.props.userId ? (
          <div className="container">
            <div className="left-content">
              <TreeView
                selectionMode="single"
                selectByClick={true}
                onItemSelectionChanged={this.handleTreeViewSelectionChange}
                dataSource={this.customStore}
              />
            </div>
            <div className="right-content">{this.renderTreeContent()}</div>
          </div>
        ) : (
          <LoginElement
            onLogin={(login: string, password: string) => {
              getStore().dispatch(loginRequested(login, password));
            }}
          />
        )}
      </div>
    );
  }

  renderTreeContent(): JSX.Element | undefined {
    // console.log(`Cookies: ${inspect(document.cookie)}`);

    const menuItem: MainMenyItem = this.state.selectedMenuItem;
    //console.log(`Rendering content: ${JSON.stringify(menuItem, null, 4)}`);
    if (menuItem) {
      switch (menuItem.element) {
        case TreeMenuItemType.Transactions:
          return <TransactionViewElement userId={this.props.userId} />;
        case TreeMenuItemType.Categories:
          return <CategoryViewElement userId={this.props.userId} />;
        case TreeMenuItemType.Businesses:
          return <BusinessViewElement userId={this.props.userId} />;
        case TreeMenuItemType.Spendings:
          return <SpendingsViewElement userId={this.props.userId} />;
        case TreeMenuItemType.Accounts:
          return <AccountsViewElement userId={this.props.userId} />;
      }
    }
    return undefined;
  }

  handleTreeViewSelectionChange(e: any) {
    const selectedMenuItem: MainMenyItem = e.itemData;
    // console.log(JSON.stringify(selectedMenuItem));
    this.setState({
      selectedMenuItem: selectedMenuItem,
    });
  }
}

export default Hello;
