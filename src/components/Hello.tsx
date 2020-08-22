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
import { loginRequested } from '../actions/loginActions';
import { LoadIndicator } from 'devextreme-react';
import { Props } from '../containers/Hello';
import BankConnectionsViewElement from '../containers/BankConnections';
import AnnualTrendsViewElement from '../containers/AnnualTrendsView';
import { TreeMenuItemType } from './model';
import { Navbar, Nav, NavDropdown, Form, FormControl, Button } from 'react-bootstrap';
import { inspect } from 'util';

interface MainMenuState {
  topMenuSelectedItemType: TreeMenuItemType;
  userId?: number;
  loginInProgress: false;
  searchPattern?: string;
}

export class Hello extends React.Component<Props, MainMenuState> {
  constructor(props: Props) {
    super(props);
    console.log('called Hello  constructor');
    this.state = {
      loginInProgress: false,
      topMenuSelectedItemType: TreeMenuItemType.Spendings,
    };

    this.handleTopMenuSelectionChange = this.handleTopMenuSelectionChange.bind(this);
    this.renderTreeContent = this.renderTreeContent.bind(this);
  }



  customStore: {
    store: CustomStore;
  };

  render() {
    const searchDisplayValue = this.state.searchPattern || '';
    // console.log(`Rendering, search pattern ${searchDisplayValue}`);
    return (
      <div>
        {this.props.sessionData && this.props.userId ? (
          <div>
            <div className="top-menu">
              <Navbar bg="dark" variant="dark">
                <Navbar.Brand href="https://www.dinero-app.com">
                  <img
                    alt=""
                    // src="/logo.svg"
                    src="https://ams3.digitaloceanspaces.com/www.dinero-app.com/dinero-icon.png"
                    width="30"
                    height="30"
                    className="d-inline-block align-top"
                  />{' '}dinero-app.com</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                  <Nav className="mr-auto">
                    <NavDropdown title="Spendings" id="basic-nav-dropdown" bg="dark" variant="dark">
                      <NavDropdown.Item bg="dark" variant="dark"
                        onClick={() => { this.handleTopMenuSelectionChange(TreeMenuItemType.Spendings); }}
                      >Spendings Summary</NavDropdown.Item>
                      <NavDropdown.Item
                        onClick={() => { this.handleTopMenuSelectionChange(TreeMenuItemType.AnnualTrends); }}
                      >Annual Trends</NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item
                        onClick={() => { this.handleTopMenuSelectionChange(TreeMenuItemType.Transactions); }}
                      >Bank Transactions</NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item
                        onClick={() => { this.handleTopMenuSelectionChange(TreeMenuItemType.Categories); }}
                      >Manage Spendings Categories</NavDropdown.Item>
                      <NavDropdown.Item
                        onClick={() => { this.handleTopMenuSelectionChange(TreeMenuItemType.ImportTransactions); }}
                      >Import Transactions Manually</NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown title="Account" id="basic-nav-dropdown" >
                      <NavDropdown.Item
                        onClick={() => { this.handleTopMenuSelectionChange(TreeMenuItemType.Accounts); }}
                      >Manage Bank Accounts</NavDropdown.Item>
                      <NavDropdown.Item
                        onClick={() => { this.handleTopMenuSelectionChange(TreeMenuItemType.BankConnections); }}
                      >Manage Bank Connections</NavDropdown.Item>
                      <NavDropdown.Item
                        onClick={() => { this.handleTopMenuSelectionChange(TreeMenuItemType.Businesses); }}
                      >Manage Businesses</NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item onClick={() => { this.props.logout(); }} >SignOut</NavDropdown.Item>
                    </NavDropdown>
                  </Nav>
                  <Form inline>
                    <FormControl
                      type="text"
                      size="sm"
                      className="mr-sm-2"
                      //text={searchDisplayValue}
                      onChange={(event) => {
                        this.setState({ ...this.state, searchPattern: event.target.value });
                      }}
                      placeholder="Search"
                    />
                    <Button variant="outline-info"
                      onClick={() => {
                        this.handleTopMenuSelectionChange(TreeMenuItemType.Transactions);
                        if (this.props.searchTransactions && this.state.searchPattern) {
                          this.props.searchTransactions(this.state.searchPattern || '');
                        } else if (this.state.searchPattern === undefined && this.props.clearTransactionSearch) {
                          this.props.clearTransactionSearch();
                        }
                      }}
                      size="sm"
                    >Search</Button>
                  </Form>
                </Navbar.Collapse>
              </Navbar>
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

  componentWillReceiveProps(nextProps: Props) {
    // console.log(`componentWillReceiveProps: ${inspect(nextProps)}`);
    // console.log(`current state: ${inspect(this.state)}`);
    // const switchToTransactions = this.state.searchPattern !== nextProps.transactionSearchPattern;
    // console.log(`switchToTransactions: ${switchToTransactions}`);
    // console.log(`this.state.searchPattern: ${this.state.searchPattern}`);
    // console.log(`nextProps.transactionSearchPattern: ${nextProps.transactionSearchPattern}`);

    if (this.state.searchPattern !== nextProps.transactionSearchPattern) {
      this.setState({
        ...this.state,
        searchPattern: nextProps.transactionSearchPattern,
        // topMenuSelectedItemType: switchToTransactions ? TreeMenuItemType.Transactions :
        // this.state.topMenuSelectedItemType
      });
    }

  }

  renderTreeContent(): JSX.Element | undefined {
    // console.log(`Rendering ${this.state.topMenuSelectedItemType}`);
    console.log(`Rendering rigt content, search pattern ${this.state.searchPattern}`);
    switch (this.state.topMenuSelectedItemType) {
      case TreeMenuItemType.Transactions:
        return <TransactionViewElement userId={this.props.userId}
          transactionSearchPattern={this.props.transactionSearchPattern}
          clearTransactionSearch={this.props.clearTransactionSearch} />;
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

  handleTopMenuSelectionChange(type: TreeMenuItemType) {
    if (this.state.topMenuSelectedItemType === type) {
      return;
    }

    this.setState({
      ...this.state,
      topMenuSelectedItemType: type,
    });
  }
}

export default Hello;
