import * as React from 'react';
import './Hello.css';
import TransactionViewElement from '../containers/TransactionView';
import CategoryViewElement from '../containers/CategoryView';
import CustomStore from 'devextreme/data/custom_store';
import BusinessViewElement from '../containers/BusinessView';
import SpendingsViewElement from '../containers/SpendingsView';
import AccountsViewElement from '../containers/AccountsView';
import LoginElement from '../containers/LoginContainer';
import { getStore } from '..';
import { loginRequested } from '../actions';
import { LoadIndicator, Menu } from 'devextreme-react';
import { Props } from '../containers/Hello';
import BankConnectionsViewElement from '../containers/BankConnections';
import AnnualTrendsViewElement from '../containers/AnnualTrendsView';
import { TreeMenuItemType, MainMenyItem, TopMenuItem, menuItemsSource, categoriesMenuItem } from './model';
import { categoriesReadDataSource } from './categoriesReadDataSource';

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

  topViewAnnualTrendsMenuItem: TopMenuItem = {
    text: 'Annual Trends',
    type: TreeMenuItemType.AnnualTrends,
    onClick: () => {
      this.handleTopMenuSelectionChange(this.topViewAnnualTrendsMenuItem);
    },
  };

  topSpendingsMenuItem: TopMenuItem = {
    text: 'Spendings',
    type: TreeMenuItemType.Spendings,
    items: [this.topViewAnnualTrendsMenuItem, this.topViewSpendingsMenuItem, this.topCategoriesMenuItem],
    onClick: () => {
      this.handleTopMenuSelectionChange(this.topViewSpendingsMenuItem);
    },
  };

  topMenuItems = [this.topSpendingsMenuItem, this.topTransactionsMenuItem, this.topMyAccountMenuItem];

  render() {
    if (this.props && this.props.userId) {
      const userId = this.props.userId;
      if (!this.customStore) {
        this.customStore = {
          store: new CustomStore({
            load: function () {
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
      case TreeMenuItemType.BankConnections:
        return <BankConnectionsViewElement userId={this.props.userId!} />;
      case TreeMenuItemType.AnnualTrends:
        return <AnnualTrendsViewElement userId={this.props.userId!} />;
    }
    return undefined;
  }

  handleTopMenuSelectionChange(e: TopMenuItem) {
    this.setState({
      topMenuSelectedItemType: e.type,
    });
  }
}

export default Hello;
