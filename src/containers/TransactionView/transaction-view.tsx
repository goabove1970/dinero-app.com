import * as React from 'react';

import 'devextreme/data/odata/store';
import DataGrid, { Column, Paging, Pager, Lookup, Sorting } from 'devextreme-react/data-grid';
import 'whatwg-fetch';

import './transaction-view.css';
import notify from 'devextreme/ui/notify';
import { buildTransactionDataSource } from './transactionDataSource';
import ContextMenu from 'devextreme-react/context-menu';
import {
  TransactionIntervalType,
  TransactionIntervalSelectionOption,
  buildTransactionIntervalOption,
  renderIntervalButtonsRow,
} from '../common/intervals';
import {
  TransactionCategorizationType,
  TransactionCategorizationSelectionOption,
  renderCategorizationButtonsRow,
} from '../common/categorization';
import { buildCategoriesDataSource } from '../../dataSources/categoriesDataSource';
import CustomStore from 'devextreme/data/custom_store';
import { buildTransactionContextMenuDataSource, ContextMenuItem } from './transactionContextMenuDataSource';
import { category, categoryTreeNode } from '../../contracts/categoryTreeNode';
import { CheckBox, FileUploader, LoadIndicator, Popup } from 'devextreme-react';

import { Accordion, Card, Form, Button } from 'react-bootstrap';
import { AccountResponseModel, Account } from '../../models/Account';
import { buildAccountsDataSource } from '../../dataSources/accountsDataSource';
import { inspect } from 'util';
import { renderMonthsIntervalButtonsRow } from '../common/months';
import moment = require('moment');
import { renderAccountsButtonsRow } from '../common/accountsRow';
import { Transaction } from '../../models/transaction';

const uploaderServiceUrl = 'http://localhost:9300/transactions/upload';

export interface TransactionViewProps {
  userId?: string;
  transactionSearchPattern?: string;
  clearTransactionSearch?: () => void;
}

export interface TransactionImportInfo {
  detected?: number;
  merged?: number;
  duplicates?: number;
}

export interface TransactionViewState {
  selectedIntervalType?: TransactionIntervalType;
  transactionsForMonth?: Date;
  selectedCategorizationType: TransactionCategorizationType;
  selectedAccountId?: string;
  showHidden: false;
  showExcluded: false;
  selectedTransaction?: any;
  accountsLoaded: boolean;
  accounts?: AccountResponseModel[];
  uploadTransactionPopupVisible?: boolean;
  transactionImportInfo?: TransactionImportInfo;
  selectedTransactions?: Transaction[];
  searchTransactionsFilter?: string;
}

const categoryReadTransformation = (loadedCategories: category[]): categoryTreeNode[] => {
  return loadedCategories.map((c: category) => {
    return {
      caption: c.caption,
      categoryId: c.categoryId,
      key: c.categoryId,
      items: [],
    };
  });
};

export class TransactionViewElement extends React.Component<TransactionViewProps, TransactionViewState> {
  categoriesStore: { store: CustomStore };
  transactionsStore: { store: CustomStore };
  acctDataStore: { store: CustomStore };

  constructor(props: TransactionViewProps) {
    super(props);
    console.log(`props.transactionSearchPattern ${props.transactionSearchPattern}`);

    this.state = {
      selectedIntervalType: TransactionIntervalType.lastMonth,
      selectedCategorizationType: 'all',
      showHidden: false,
      showExcluded: false,
      accountsLoaded: false,
      accounts: [],
      uploadTransactionPopupVisible: false,
      searchTransactionsFilter: props.transactionSearchPattern
    };

    console.log(`this.state.searchTransactionsFilter ${this.state.searchTransactionsFilter}`);

    this.onMonthChanged = this.onMonthChanged.bind(this);
    this.onTransactionIntervalChanged = this.onTransactionIntervalChanged.bind(this);
    this.onTransactionCategorizationChanged = this.onTransactionCategorizationChanged.bind(this);
    this.contextMenuItemClick = this.contextMenuItemClick.bind(this);
    this.contextMenuItemRender = this.contextMenuItemRender.bind(this);
    this.onShowHiddenChanged = this.onShowHiddenChanged.bind(this);
    this.onShowExcludedChanged = this.onShowExcludedChanged.bind(this);
    this.buildTransactionContextMenuSource = this.buildTransactionContextMenuSource.bind(this);
    this.showTransactionImportInfo = this.showTransactionImportInfo.bind(this);
    this.hideTransactionImportInfo = this.hideTransactionImportInfo.bind(this);
    this.onTransactionImportComplete = this.onTransactionImportComplete.bind(this);
    this.onSelectedAccountChanged = this.onSelectedAccountChanged.bind(this);
    this.transactionSelectionChanged = this.transactionSelectionChanged.bind(this);
  }


  componentWillReceiveProps(nextProps: TransactionViewProps) {

    // console.log(`this.state.searchTransactionsFilter ${this.state.searchTransactionsFilter}`);
    // console.log(`nextProps.transactionSearchPattern ${nextProps.transactionSearchPattern}`);
    this.setState({
      ...this.state,
      searchTransactionsFilter: nextProps.transactionSearchPattern,
    });
  }

  onTransactionIntervalChanged(e: any) {
    // console.log('onMonthChanged');
    // console.log(inspect(e.target.dataset.elementattr));

    const selectedIntervalData = JSON.parse(e.target.dataset.elementattr) as TransactionIntervalSelectionOption;
    notify(`Requesting transactions for ${selectedIntervalData.caption}`);
    this.setState({
      ...this.state,
      selectedIntervalType: selectedIntervalData.intervalType,
      transactionsForMonth: undefined,
    });
  }

  onMonthChanged(e: any) {
    const selectedIntervalData = JSON.parse(e.target.dataset.elementattr) as TransactionIntervalSelectionOption;
    notify(`Requesting transactions for ${selectedIntervalData.caption}`);
    this.setState({
      ...this.state,
      selectedIntervalType: undefined,
      transactionsForMonth: moment(selectedIntervalData.startDate).startOf('month').toDate(),
    });
  }

  onTransactionImportComplete(e: any) {
    console.log(`onTransactionImportComplete: ${inspect(e)}`);
    this.showTransactionImportInfo({});
  }

  onTransactionCategorizationChanged(e: any) {
    const selectedCategorizationData = JSON.parse(e.target.dataset.elementattr) as TransactionCategorizationSelectionOption;
    notify(`Requesting transactions for ${selectedCategorizationData.caption}`);
    this.setState({
      ...this.state,
      selectedCategorizationType: selectedCategorizationData.categorizationType,
    });
  }

  onSelectedAccountChanged(e: any) {
    const selectedAcctData = JSON.parse(e.target.dataset.elementattr) as Account;
    notify(`Requesting transactions for account ${selectedAcctData.alias}`);
    this.setState({
      ...this.state,
      selectedAccountId: selectedAcctData.accountId,
    });
  }

  contextMenuItemClick(e: any) {
    // console.log(`contextMenuItemClick: ${inspect(e)}`);
    console.log(`this.selectedTransactions: ${inspect(this.state.selectedTransactions)}`);

    const selectedMenuItem: ContextMenuItem = e.itemData;
    const transactions = this.state.selectedTransactions || [];
    console.log(`contextMenuItemClick, transactions ${inspect(transactions)}`);
    if (!selectedMenuItem || transactions.length === 0) {
      return;
    }

    const categoryId: string | undefined = selectedMenuItem.id;
    switch (selectedMenuItem.itemType) {
      case 'moveToCategory':
        {
          console.log(`moveToCategory ${categoryId}`);
          console.log(
            `Moving transactions ${transactions.map((s) => s.transactionId).join(', ')} to category ${categoryId}`
          );
          const updatePromises: Promise<any>[] = [];
          for (let i = 0; i < transactions.length; ++i) {
            const transactionId = transactions[i].transactionId;
            updatePromises.push(
              this.transactionsStore.store.update(transactionId, {
                categoryId,
              })
            );
          }

          Promise.all(updatePromises).then(() => {
            console.log('Update promise resolved');
            this.reloadTransactions();
          });
        }
        break;
      case 'unhide':
      case 'hide':
        {
          const action = selectedMenuItem.itemType;
          const updatePromises: Promise<any>[] = [];
          for (let i = 0; i < transactions.length; ++i) {
            const transactionId = transactions[i].transactionId;
            updatePromises.push(
              this.transactionsStore.store.update(transactionId, {
                statusModification: action,
              })
            );
          }

          Promise.all(updatePromises).then(() => {
            this.reloadTransactions();
          });
        }
        break;
      case 'include':
      case 'exclude':
        {
          const action = selectedMenuItem.itemType;
          // console.log(`Including/Excluding transaction ${transactionId}`);
          const updatePromises: Promise<any>[] = [];
          for (let i = 0; i < transactions.length; ++i) {
            const transactionId = transactions[i].transactionId;
            updatePromises.push(
              this.transactionsStore.store.update(transactionId, {
                statusModification: action,
              })
            );
          }

          Promise.all(updatePromises).then(() => {
            this.reloadTransactions();
          });
        }
        break;
    }
  }

  onShowHiddenChanged(e: any) {
    this.setState({
      ...this.state,
      showHidden: e.value,
    });
  }

  onShowExcludedChanged(e: any) {
    this.setState({
      ...this.state,
      showExcluded: e.value,
    });
  }

  contextMenuItemRender(e: any): React.ReactNode {
    let itemText = e.text;

    return (
      <div className="dx-item-content dx-menu-item-content">
        <span className="dx-menu-item-text">{itemText}</span>
        {e.items && e.items.length > 0 ? (
          <span className="dx-menu-item-popout-container">
            <div className="dx-menu-item-popout"></div>
          </span>
        ) : (
            <span />
          )}
      </div>
    );
  }

  transactionSelectionChanged(e: any) {
    // console.log(`selectedTransactions: (${inspect(e.selectedRowsData)})`);
    this.setState({ ...this.state, selectedTransactions: e.selectedRowsData });
  }

  buildTransactionContextMenuSource(userId?: string): TransactionContextMenuSource {
    // console.log('Building transaction context menu data source');
    const loadCategoriesSource = buildTransactionContextMenuDataSource(userId);
    const source: TransactionContextMenuSource = {
      store: new CustomStore({
        load: function (): Promise<any> {
          return loadCategoriesSource.store.load().then((categories: ContextMenuItem[]) => {
            const newMenu: ContextMenuItem[] = [];
            const hideElement: ContextMenuItem = {
              text: 'Hide Transaction',
              id: 'hide',
              itemType: 'hide',
            };
            const unhideElement: ContextMenuItem = {
              text: 'Unhide Transaction',
              id: 'unhide',
              itemType: 'unhide',
            };
            const excludeElement: ContextMenuItem = {
              text: 'Exclude From Total',
              id: 'exclude',
              itemType: 'exclude',
            };
            const includeElement: ContextMenuItem = {
              text: 'Include In Total',
              id: 'include',
              itemType: 'include',
            };
            const visibility: ContextMenuItem = {
              beginGroup: true,
              text: 'Visibility',
              id: 'visibility_menu',
              itemType: 'empty',
              items: [hideElement, unhideElement],
              icon: 'rowfield',
            };
            const inclusion: ContextMenuItem = {
              text: 'Inclusion',
              id: 'inlusion_menu',
              itemType: 'empty',
              items: [excludeElement, includeElement],
              icon: 'datafield',
            };
            categories.forEach((c) => newMenu.push(c));
            newMenu.push(visibility);
            newMenu.push(inclusion);
            return newMenu;
          });
        },
      }),
    };

    return source;
  }

  reloadTransactions() {
    this.acctDataStore.store.load().then((res) =>
      this.setState({
        ...this.state,
        accounts: res.data,
        accountsLoaded: true,
        selectedTransactions: [],
      })
    );
  }

  componentDidMount() {
    this.reloadTransactions();
  }

  buildTransUploader = (acc: AccountResponseModel) => {
    if (!acc) {
      return {};
    }
    let acctName = acc.alias || acc.accountId;
    return (
      <div className="transaction-file-import">
        <FileUploader
          multiple={false}
          accept={'*'}
          uploadMode={'instantly'}
          labelText={'or Drop transactions file here'}
          selectButtonText={`Imoprt to ${acctName}`}
          uploadUrl={`${uploaderServiceUrl}/${acc.accountId}`}
          uploadMethod={'POST'}
          onUploaded={this.onTransactionImportComplete}
        />
      </div>
    );
  };

  buildTransUploaderBlock = () => {
    if (!this.state.accountsLoaded || !this.state.accounts) {
      return <LoadIndicator id="large-indicator" height={60} width={60} />;
    }
    return this.state.accounts.map((acct) => {
      return this.buildTransUploader(acct);
    });
  };

  showTransactionImportInfo(info: TransactionImportInfo) {
    this.setState({
      ...this.state,
      transactionImportInfo: info,
      uploadTransactionPopupVisible: true,
    });
  }

  hideTransactionImportInfo() {
    this.setState({
      ...this.state,
      transactionImportInfo: undefined,
      uploadTransactionPopupVisible: false,
    });
  }

  render(): JSX.Element {
    let startDate: Date | undefined = moment().startOf('month').toDate();
    let endDate: Date | undefined = moment().startOf('month').add(1, 'month').subtract(1, 'day').toDate();

    if (this.state.selectedIntervalType) {
      const intervalOption = buildTransactionIntervalOption(this.state.selectedIntervalType);
      startDate = intervalOption!.startDate;
      endDate = intervalOption!.endDate;
    } else if (this.state.transactionsForMonth) {
      startDate = moment(this.state.transactionsForMonth).startOf('month').toDate();
      endDate = moment(startDate).startOf('month').add(1, 'month').subtract(1, 'day').toDate();
    }
    this.categoriesStore = buildCategoriesDataSource(this.props.userId, categoryReadTransformation);

    console.log(`this.state.searchTransactionsFilter ${this.state.searchTransactionsFilter}`);
    this.transactionsStore = buildTransactionDataSource({
      startDate,
      endDate,
      categorization: this.state.selectedCategorizationType,
      showHidden: this.state.showHidden,
      showExcluded: this.state.showExcluded,
      userId: this.props.userId,
      accountId: this.state.selectedAccountId,
      transactionSearchPattern: this.state.searchTransactionsFilter,
    });
    const categoriesContextMenu = this.buildTransactionContextMenuSource(this.props.userId);
    this.acctDataStore = buildAccountsDataSource({ userId: this.props.userId });
    return (

      <div>
        {this.props.transactionSearchPattern !== undefined &&
          <div className="transaction-search-dismiss">
            <Button
              size="sm"
              variant={'outline-primary'}
              onClick={() => {
                if (this.props.clearTransactionSearch) {
                  this.props.clearTransactionSearch();
                }
              }}>
              {this.props.transactionSearchPattern} &times;
            </Button>
            <br />
          </div>
        }
        <div className="filter-accordeon">
          <Accordion defaultActiveKey="0">
            <Card>
              <Accordion.Toggle as={Card.Header} eventKey="0" size="sm">
                Transaction Filter
            </Accordion.Toggle>
              <Accordion.Collapse eventKey="0">
                <Form margin={"10px"}>
                  {renderIntervalButtonsRow(this.state.selectedIntervalType, this.onTransactionIntervalChanged)}
                  {renderMonthsIntervalButtonsRow(this.state.transactionsForMonth, this.onMonthChanged, 6)}
                  {renderCategorizationButtonsRow(
                    this.state.selectedCategorizationType,
                    this.onTransactionCategorizationChanged
                  )}
                  {renderAccountsButtonsRow(this.state.accounts, this.state.selectedAccountId, this.onSelectedAccountChanged)}
                </Form>
              </Accordion.Collapse>
            </Card>
          </Accordion>
        </div>
        <div className="transaction-content">
          <div className="transactions-grid">
            <DataGrid
              key={'transactionId'}
              dataSource={this.transactionsStore}
              columnAutoWidth={true}
              showBorders={true}
              showRowLines={true}
              selection={{ mode: 'multiple' }}
              hoverStateEnabled={true}
              onSelectionChanged={this.transactionSelectionChanged}
              selectedRowKeys={(this.state.selectedTransactions || []).map((t) => t.transactionId)}
            >
              <Sorting></Sorting>
              <Paging defaultPageSize={50} />
              <Pager showPageSizeSelector={true} allowedPageSizes={[5, 10, 20, 100]} showInfo={true} />
              <Column
                dataField={'chaseTransaction.PostingDate'}
                caption="Date"
                dataType="date"
                defaultSortOrder="desc"
                sortOrder="desc"
                sortIndex={0}
                width={90}
              />
              <Column dataField={'importedDate'} caption="Imported" dataType="date" width={90} />
              <Column
                dataField={'chaseTransaction.Description'}
                caption="Description"
                width={500}
                dataType="asc"
                defaultSortOrder="asc"
                sortIndex={1}
              >
              </Column>
              <Column dataField={'chaseTransaction.BankDefinedCategory'} caption="Bank Category" width={100} />
              <Column dataField={'chaseTransaction.CreditCardTransactionType'} caption="Spending Type" width={80} />
              <Column dataField={'categoryId'} caption="Category" dataType="string" width={170}>
                <Lookup dataSource={this.categoriesStore} valueExpr="categoryId" displayExpr="caption" />
              </Column>
              <Column dataField={'chaseTransaction.Amount'} caption="Amount" width={80} />
              <Column dataField={'chaseTransaction.Balance'} caption="Balance" width={80} />
            </DataGrid>
          </div>

          <Accordion>
            <Card>
              <Accordion.Toggle as={Card.Header} eventKey="0" size="sm">
                Upload Transactions
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="0">
                <Form>
                  {this.buildTransUploaderBlock()}
                </Form>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Accordion.Toggle as={Card.Header} eventKey="1" size="sm">
                Transaction Options
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="1">
                <Form>
                  <CheckBox
                    value={this.state.showHidden}
                    defaultValue={true}
                    onValueChanged={this.onShowHiddenChanged}
                    text="Show Hidden Transactions"
                  />
                  <CheckBox
                    value={this.state.showExcluded}
                    defaultValue={true}
                    onValueChanged={this.onShowExcludedChanged}
                    text="Show Excluded Transactions"
                  />
                </Form>
              </Accordion.Collapse>
            </Card>
          </Accordion>
          <ContextMenu
            dataSource={categoriesContextMenu}
            width={200}
            target=".dx-data-row"
            onItemClick={this.contextMenuItemClick}
            //itemRender={this.contextMenuItemRender}
            animation={{
              show: { type: 'fade', from: 0, to: 1, duration: 100 },
              hide: { type: 'fade', from: 1, to: 0, duration: 100 },
            }}
          />
          {this.state.transactionImportInfo && (
            <Popup
              visible={this.state.uploadTransactionPopupVisible}
              onHiding={this.hideTransactionImportInfo}
              dragEnabled={false}
              closeOnOutsideClick={true}
              showTitle={true}
              title="Transaction Import"
              width={300}
              height={250}
            >
              <p>
                Recognized Transactions&nbsp;
              <span>{this.state.transactionImportInfo!.detected}</span>&nbsp;
            </p>
              <p>
                Merged Transaction: <span>{this.state.transactionImportInfo!.merged}</span>
              </p>
              <p>
                Duplicates (skipped): <span>{this.state.transactionImportInfo!.duplicates}</span>
              </p>
            </Popup>
          )}
        </div>
      </div >

    );
  }
}

export class TransactionContextMenuSource {
  store: CustomStore;
}

export default TransactionViewElement;
