import * as React from 'react';

import 'devextreme/data/odata/store';
import DataGrid, { Column, Paging, Editing, Pager, Lookup, Sorting, GroupItem } from 'devextreme-react/data-grid';
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
import {
  buildTransactionContextMenuDataSource,
  ContextMenuItem,
  TransactionContextMenuItemType,
} from './transactionContextMenuDataSource';
import { category, categoryTreeNode } from '../../contracts/categoryTreeNode';
import { CheckBox, Accordion, FileUploader, LoadIndicator, Popup } from 'devextreme-react';
import { Label } from 'devextreme-react/form';
import { AccountResponseModel } from '../../models/Account';
import { buildAccountsDataSource } from '../../dataSources/accountsDataSource';
import { inspect } from 'util';
import { renderMonthsIntervalButtonsRow } from '../common/months';
import moment = require('moment');
// import { inspect } from 'util';

export interface TransactionViewProps {
  userId?: string;
}

export interface AccordionItemWrapper {
  title: string;
  type: string;
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
  selectedAccordionItems: AccordionItemWrapper[];
  showHidden: false;
  showExcluded: false;
  selectedTransaction?: any;
  accountsLoaded: boolean;
  accounts?: AccountResponseModel[];
  uploadTransactionPopupVisible?: boolean;
  transactionImportInfo?: TransactionImportInfo;
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
  selectedRowData: any;
  filteringOptionsAccordionItem: AccordionItemWrapper = {
    title: 'Filtering Options',
    type: 'filtering_options',
  };
  importAccordionItem: AccordionItemWrapper = {
    title: 'Import Transactions',
    type: 'import_transactions',
  };

  constructor(props: TransactionViewProps) {
    super(props);

    this.state = {
      selectedIntervalType: TransactionIntervalType.lastMonth,
      selectedCategorizationType: 'all',
      showHidden: false,
      showExcluded: false,
      selectedAccordionItems: [],
      // selectedAccordionItems: [this.filteringOptionsAccordionItem],
      accountsLoaded: false,
      accounts: [],
      uploadTransactionPopupVisible: false,
    };
    this.onMonthChanged = this.onMonthChanged.bind(this);
    this.onTransactionIntervalChanged = this.onTransactionIntervalChanged.bind(this);
    this.onTransactionCategorizationChanged = this.onTransactionCategorizationChanged.bind(this);
    this.itemClick = this.itemClick.bind(this);
    this.contextMenuPerparing = this.contextMenuPerparing.bind(this);
    this.contextMenuItemRender = this.contextMenuItemRender.bind(this);
    this.onShowHiddenChanged = this.onShowHiddenChanged.bind(this);
    this.onShowExcludedChanged = this.onShowExcludedChanged.bind(this);
    this.buildTransactionContextMenuSource = this.buildTransactionContextMenuSource.bind(this);
    this.isSelectedTransactionHidden = this.isSelectedTransactionHidden.bind(this);
    this.accordionSelectionChanged = this.accordionSelectionChanged.bind(this);
    this.showTransactionImportInfo = this.showTransactionImportInfo.bind(this);
    this.hideTransactionImportInfo = this.hideTransactionImportInfo.bind(this);
    this.onTransactionImportComplete = this.onTransactionImportComplete.bind(this);
  }

  onTransactionIntervalChanged(e: any) {
    const selectedIntervalData = e.component.option('elementAttr') as TransactionIntervalSelectionOption;
    notify(`Requesting transactions for ${selectedIntervalData.caption}`);
    this.setState({
      ...this.state,
      selectedIntervalType: selectedIntervalData.intervalType,
      transactionsForMonth: undefined,
    });
  }

  onMonthChanged(e: any) {
    const selectedIntervalData = e.component.option('elementAttr') as TransactionIntervalSelectionOption;
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
    const selectedCategorizationData = e.component.option('elementAttr') as TransactionCategorizationSelectionOption;
    notify(`Requesting transactions for ${selectedCategorizationData.caption}`);
    this.setState({
      ...this.state,
      selectedCategorizationType: selectedCategorizationData.categorizationType,
    });
  }

  itemClick(e: any) {
    // console.log(`itemClick: ${JSON.stringify(e.itemData, null, 4)}`);
    const selectedMenuItem: ContextMenuItem = e.itemData;
    const transaction =
      (this.selectedRowData && this.selectedRowData.row && this.selectedRowData.row.data) || undefined;
    if (!selectedMenuItem || !transaction) {
      return;
    }
    // console.log(`Selected transaction: ${inspect(transaction)}`);

    const transactionId = transaction.transactionId;
    const categoryId: string | undefined = selectedMenuItem.id;

    switch (selectedMenuItem.itemType) {
      case TransactionContextMenuItemType.moveToCategory:
        {
          // console.log(`Moving transaction ${transactionId} to category ${categoryId}`);
          this.transactionsStore.store
            .update(transactionId, {
              categoryId,
            })
            .then(() => {
              if (this.selectedRowData && this.selectedRowData.component) {
                // console.log(`Refreshing component...`);
                this.selectedRowData.component.refresh();
              }
            });
        }
        break;
      case TransactionContextMenuItemType.hideUnhide:
        {
          // console.log(`Hiding/Unhiding transaction ${transactionId}`);
          let hideUnhide = 'hide';
          if (transaction.isHidden) {
            hideUnhide = 'unhide';
          }

          this.transactionsStore.store
            .update(transactionId, {
              statusModification: hideUnhide,
            })
            .then(() => {
              if (this.selectedRowData && this.selectedRowData.component) {
                // console.log(`Refreshing component...`);
                this.selectedRowData.component.refresh();
              }
            });
        }
        break;
      case TransactionContextMenuItemType.includeExclude:
        {
          // console.log(`Including/Excluding transaction ${transactionId}`);
          let includeExclude = 'exclude';
          if (transaction.isExcluded) {
            includeExclude = 'include';
          }

          this.transactionsStore.store
            .update(transactionId, {
              statusModification: includeExclude,
            })
            .then(() => {
              if (this.selectedRowData && this.selectedRowData.component) {
                // console.log(`Refreshing component...`);
                this.selectedRowData.component.refresh();
              }
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

  accordionSelectionChanged(e: any) {
    // console.log(`accordionSelectionChanged: ${inspect(e)}`);
    let newAccordionSelection = this.state.selectedAccordionItems;
    e.addedItems.forEach((element: AccordionItemWrapper) => {
      newAccordionSelection.push(element);
    });
    e.removedItems.forEach((element: AccordionItemWrapper) => {
      newAccordionSelection = newAccordionSelection.filter((e) => e !== element);
    });
    this.setState({ ...this.state, selectedAccordionItems: newAccordionSelection });
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

  isSelectedTransactionHidden() {
    const transaction =
      (this.selectedRowData && this.selectedRowData.row && this.selectedRowData.row.data) || undefined;
    const hidden = (transaction && transaction.isHidden) || false;
    return hidden;
  }

  contextMenuPerparing(e: any) {
    this.selectedRowData = e;
  }

  buildTransactionContextMenuSource(userId?: string): TransactionContextMenuSource {
    // console.log('Building transaction context menu data source');
    const loadCategoriesSource = buildTransactionContextMenuDataSource(userId);
    const source: TransactionContextMenuSource = {
      store: new CustomStore({
        load: function (e: any): Promise<any> {
          return loadCategoriesSource.store.load().then((categories: ContextMenuItem[]) => {
            const newMenu: ContextMenuItem[] = [];
            const hideElement = {
              text: 'Hide Transaction',
              id: 'hide',
              itemType: TransactionContextMenuItemType.hideUnhide,
            };
            const unhideElement = {
              text: 'Unhide Transaction',
              id: 'unhide',
              itemType: TransactionContextMenuItemType.hideUnhide,
            };
            const excludeElement = {
              text: 'Exclude From Total',
              id: 'exclude',
              itemType: TransactionContextMenuItemType.includeExclude,
            };
            const includeElement = {
              text: 'Include In Total',
              id: 'include',
              itemType: TransactionContextMenuItemType.includeExclude,
            };
            const visibility = {
              beginGroup: true,
              text: 'Visibility',
              id: 'visibility_menu',
              itemType: TransactionContextMenuItemType.empty,
              items: [hideElement, unhideElement],
              icon: 'rowfield',
            };
            const inclusion = {
              text: 'Inclusion',
              id: 'inlusion_menu',
              itemType: TransactionContextMenuItemType.empty,
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

  componentDidMount() {
    this.acctDataStore.store.load().then((res) =>
      this.setState({
        ...this.state,
        accounts: res.data,
        accountsLoaded: true,
      })
    );
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
          uploadUrl={`http://localhost:9000/transactions/upload/${acc.accountId}`}
          uploadMethod={'PUT'}
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
    this.transactionsStore = buildTransactionDataSource({
      startDate,
      endDate,
      categorization: this.state.selectedCategorizationType,
      showHidden: this.state.showHidden,
      showExcluded: this.state.showExcluded,
      userId: this.props.userId,
    });
    const categoriesContextMenu = this.buildTransactionContextMenuSource(this.props.userId);
    this.acctDataStore = buildAccountsDataSource({ userId: this.props.userId });
    return (
      <div className="transaction-content">
        <div className="transactions-span">
          <div className="caption">Transactions Filter</div>
          {renderIntervalButtonsRow(this.state.selectedIntervalType, this.onTransactionIntervalChanged)}
          {renderMonthsIntervalButtonsRow(this.state.transactionsForMonth, this.onMonthChanged, 6)}
          {renderCategorizationButtonsRow(
            this.state.selectedCategorizationType,
            this.onTransactionCategorizationChanged
          )}
        </div>
        <div className="transactions">
          <div className="caption">Transactions</div>
          <DataGrid
            dataSource={this.transactionsStore}
            columnAutoWidth={true}
            showBorders={true}
            showRowLines={true}
            selection={{ mode: 'single' }}
            hoverStateEnabled={true}
            onContextMenuPreparing={this.contextMenuPerparing}
          >
            <Sorting></Sorting>
            {/* <Editing mode="row" allowUpdating={true} allowAdding={true}></Editing> */}
            <Paging defaultPageSize={50} />
            <Pager showPageSizeSelector={true} allowedPageSizes={[5, 10, 20, 100]} showInfo={true} />
            <Column
              dataField={'chaseTransaction.PostingDate'}
              caption="Posting Date"
              dataType="date"
              defaultSortOrder="desc"
              sortOrder="desc"
              sortIndex={0}
              width={95}
            />
            <Column
              dataField={'chaseTransaction.Description'}
              caption="Description"
              width={500}
              dataType="asc"
              defaultSortOrder="asc"
              sortIndex={1}
            />
            <Column dataField={'chaseTransaction.BankDefinedCategory'} caption="Bank Category" width={100} />
            <Column dataField={'chaseTransaction.CreditCardTransactionType'} caption="Spending Type" width={80} />
            <Column dataField={'categoryId'} caption="Category" dataType="string" width={170}>
              <Lookup dataSource={this.categoriesStore} valueExpr="categoryId" displayExpr="caption" />
            </Column>
            <Column dataField={'chaseTransaction.Amount'} caption="Amount" width={80} />
            <Column dataField={'chaseTransaction.Balance'} caption="Balance" width={80} />
          </DataGrid>
        </div>
        <div>
          <Accordion
            defaultSelectedIndex={0}
            collapsible={true}
            multiple={false}
            items={[this.filteringOptionsAccordionItem, this.importAccordionItem]}
            selectedItems={this.state.selectedAccordionItems}
            itemTitleRender={(i: AccordionItemWrapper) => {
              return i.title;
            }}
            onSelectionChanged={this.accordionSelectionChanged}
            animationDuration={400}
            itemRender={(props: any) => {
              // console.log(`Rendering accordion item: ${inspect(props)}`);
              switch (props.type) {
                case 'import_transactions':
                  return this.buildTransUploaderBlock();
                case 'filtering_options':
                  return (
                    <div>
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
                    </div>
                  );
              }
            }}
          />
        </div>
        <ContextMenu
          dataSource={categoriesContextMenu}
          width={200}
          target=".dx-data-row"
          onItemClick={this.itemClick}
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
    );
  }
}

export class TransactionContextMenuSource {
  store: CustomStore;
}

export default TransactionViewElement;
