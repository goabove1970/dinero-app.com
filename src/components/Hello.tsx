import * as React from 'react';
// import React from 'react';
import './Hello.css';
import TransactionViewElement from '../containers/TransactionView';
import CategoryViewElement from '../containers/CategoryView';
// import { Props } from './Props';

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
import { LoadIndicator, Menu } from 'devextreme-react';
import { Props } from '../containers/Hello';

export enum TreeMenuItemType {
  Transactions,
  BankConnections,
  Accounts,
  Categories,
  SubCategories,
  Businesses,
  Spendings,
  ManageAccount,
  SignOut,
  ImportTransactions,
}

export interface MainMenyItem {
  // id: string;
  text: string;
  expanded: boolean;
  element: TreeMenuItemType;
  items?: MainMenyItem[];
}

export interface TopMenuItem {
  text: string;
  type: TreeMenuItemType;
  items?: TopMenuItem[];
  onClick: () => void;
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
  text: 'Bank Accounts',
  expanded: false,
  element: TreeMenuItemType.Accounts,
  items: [],
};

const signOutMenuItem = {
  // id: '2',
  text: 'Sign Out',
  expanded: false,
  element: TreeMenuItemType.SignOut,
  items: [],
};

const myAccountMenuItem = {
  // id: '2',
  text: 'My Accounts',
  expanded: false,
  element: TreeMenuItemType.ManageAccount,
  items: [signOutMenuItem],
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
  myAccountMenuItem,
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
  topMenuSelectedItemType: TreeMenuItemType;
  userId?: number;
  loginInProgress: false;
}

export class Hello extends React.Component<Props, MainMenuState> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedMenuItem: menuItemsSource[0],
      loginInProgress: false,
      topMenuSelectedItemType: TreeMenuItemType.Spendings,
    };

    // this.handleTreeViewSelectionChange = this.handleTreeViewSelectionChange.bind(this);
    this.handleTopMenuSelectionChange = this.handleTopMenuSelectionChange.bind(this);
    this.renderTreeContent = this.renderTreeContent.bind(this);
  }

  customStore: {
    store: CustomStore;
  };

  topSignOuteMenuItem: TopMenuItem = {
    text: 'Sign Out',
    type: TreeMenuItemType.SignOut,
    onClick: () => {
      this.props.logout();
    },
  };

  topManageBankAccountsMenuItem: TopMenuItem = {
    text: 'Manage Bank Accounts',
    type: TreeMenuItemType.Accounts,
    onClick: () => {
      this.handleTopMenuSelectionChange(this.topManageBankAccountsMenuItem);
    },
  };

  topManageBankConnections: TopMenuItem = {
    text: 'Manage Bank Connections',
    type: TreeMenuItemType.BankConnections,
    onClick: () => {
      this.handleTopMenuSelectionChange(this.topManageBankConnections);
    },
  };

  topManageBusinessesMenuItem: TopMenuItem = {
    text: 'Manage Businesses',
    type: TreeMenuItemType.Businesses,
    onClick: () => {
      this.handleTopMenuSelectionChange(this.topManageBusinessesMenuItem);
    },
  };

  topMyAccountMenuItem: TopMenuItem = {
    text: 'My Account',
    type: TreeMenuItemType.ManageAccount,
    onClick: () => {},
    items: [
      this.topManageBankConnections,
      this.topManageBankAccountsMenuItem,
      this.topManageBusinessesMenuItem,
      this.topSignOuteMenuItem,
    ],
  };

  topImportTransactionsMenuItem: TopMenuItem = {
    text: 'Import Transactions Manually',
    type: TreeMenuItemType.ImportTransactions,
    onClick: () => {
      this.handleTopMenuSelectionChange(this.topImportTransactionsMenuItem);
    },
  };

  topViewBankTransactionsMenuItem: TopMenuItem = {
    text: 'My Bank Transactions',
    type: TreeMenuItemType.Transactions,
    onClick: () => {
      this.handleTopMenuSelectionChange(this.topViewBankTransactionsMenuItem);
    },
  };

  topTransactionsMenuItem: TopMenuItem = {
    text: 'Transactions',
    type: TreeMenuItemType.Transactions,
    items: [this.topViewBankTransactionsMenuItem, this.topImportTransactionsMenuItem],
    onClick: () => {
      this.handleTopMenuSelectionChange(this.topTransactionsMenuItem);
    },
  };

  topCategoriesMenuItem: TopMenuItem = {
    text: 'Manage Spending Categories',
    type: TreeMenuItemType.Categories,
    onClick: () => {
      this.handleTopMenuSelectionChange(this.topCategoriesMenuItem);
    },
  };

  topViewSpendingsMenuItem: TopMenuItem = {
    text: 'Spendings Summary',
    type: TreeMenuItemType.Spendings,
    onClick: () => {
      this.handleTopMenuSelectionChange(this.topViewSpendingsMenuItem);
    },
  };

  topSpendingsMenuItem: TopMenuItem = {
    text: 'Spendings',
    type: TreeMenuItemType.Spendings,
    items: [this.topViewSpendingsMenuItem, this.topCategoriesMenuItem],
    onClick: () => {
      this.handleTopMenuSelectionChange(this.topViewSpendingsMenuItem);
    },
  };

  topMenuItems = [this.topSpendingsMenuItem, this.topTransactionsMenuItem, this.topMyAccountMenuItem];

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
          <div>
            <div className="top-menu">
              <Menu
                height={30}
                dataSource={this.topMenuItems}
                displayExpr="text"
                showFirstSubmenuMode={{
                  name: 'onHover',
                  delay: { show: 0, hide: 500 },
                }}
                orientation={'horizontal'}
                submenuDirection={'auto'}
                hideSubmenuOnMouseLeave={true}
                onItemClick={(item) => {
                  item.itemData.onClick();
                }}
              />
            </div>
            <div className="container">
              {/* <div className="left-content">
                <TreeView
                  selectionMode="single"
                  selectByClick={true}
                  onItemSelectionChanged={this.handleTreeViewSelectionChange}
                  dataSource={this.customStore}
                />
              </div> */}
              <div className="right-content">{this.renderTreeContent()}</div>
            </div>
          </div>
        ) : this.props.loginInProgress ? (
          <div>
            <LoadIndicator id="large-indicator" height={60} width={60} />
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

    // const menuItem: MainMenyItem = this.state.selectedMenuItem;
    //console.log(`Rendering content: ${JSON.stringify(menuItem, null, 4)}`);
    switch (this.state.topMenuSelectedItemType) {
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
    return undefined;
  }

  // handleTreeViewSelectionChange(e: any) {
  //   const selectedMenuItem: MainMenyItem = e.itemData;

  //   this.setState({
  //     selectedMenuItem: selectedMenuItem,
  //   });
  // }

  handleTopMenuSelectionChange(e: TopMenuItem) {
    this.setState({
      topMenuSelectedItemType: e.type,
    });
  }
}

export default Hello;
