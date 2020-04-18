import * as React from 'react';

import 'devextreme/data/odata/store';
import DataGrid, { Column, Paging, Editing, Pager, Lookup, Sorting } from 'devextreme-react/data-grid';
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
} from './intervals';
import {
  TransactionCategorizationType,
  TransactionCategorizationSelectionOption,
  renderCategorizationButtonsRow,
} from './categorization';
import { buildCategoriesDataSource } from '../../dataSources/categoriesDataSource';
import CustomStore from 'devextreme/data/custom_store';
import {
  buildTransactionContextMenuDataSource,
  ContextMenuItem,
  TransactionContextMenuItemType,
} from './transactionContextMenuDataSource';
import { category, categoryTreeNode } from '../../contracts/categoryTreeNode';
import { CheckBox, Accordion } from 'devextreme-react';
import { inspect } from 'util';

export interface TransactionViewProps {
  accountId?: string;
  userId?: string;
}

export interface AccordionItemWrapper {
  title: string;
}

export interface TransactionViewState {
  selectedIntervalType: TransactionIntervalType;
  selectedCategorizationType: TransactionCategorizationType;
  selectedAccordionItems: AccordionItemWrapper[];
  showHidden: false;
  showExcluded: false;
  selectedTransaction?: any;
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
  selectedRowData: any;
  filteringOptionsAccordionItem: AccordionItemWrapper = {
    title: 'Filtering Options',
  };

  constructor(props: TransactionViewProps) {
    super(props);

    this.state = {
      selectedIntervalType: TransactionIntervalType.all,
      selectedCategorizationType: 'all',
      showHidden: false,
      showExcluded: false,
      selectedAccordionItems: [this.filteringOptionsAccordionItem],
    };
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
  }

  onTransactionIntervalChanged(e: any) {
    const selectedIntervalData = e.component.option('elementAttr') as TransactionIntervalSelectionOption;
    notify(`Requesting transactions for ${selectedIntervalData.caption}`);
    this.setState({
      ...this.state,
      selectedIntervalType: selectedIntervalData.intervalType,
    });
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
    // console.log(`contextMenuItemRender, e: ${inspect(e)}`);
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
    // console.log(`Current transaction ${transaction && transaction.transactionId} is ${hidden ? 'hidden' : 'visible'}`);
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

  render(): JSX.Element {
    const intervalOption = buildTransactionIntervalOption(this.state.selectedIntervalType);
    this.categoriesStore = buildCategoriesDataSource(this.props.userId, categoryReadTransformation);
    this.transactionsStore = buildTransactionDataSource({
      startDate: intervalOption!.startDate,
      endDate: intervalOption!.endDate,
      categorization: this.state.selectedCategorizationType,
      showHidden: this.state.showHidden,
      showExcluded: this.state.showExcluded,
    });
    const categoriesContextMenu = this.buildTransactionContextMenuSource(this.props.userId);
    return (
      <div className="transaction-content">
        <div>
          <b>Transactions</b>
          <div className="sub-title">
            <div>Transactions for account {this.props.accountId}</div>
            <div>Transactions for user {this.props.userId}</div>
          </div>
        </div>
        {renderIntervalButtonsRow(this.state.selectedIntervalType, this.onTransactionIntervalChanged)}
        {renderCategorizationButtonsRow(this.state.selectedCategorizationType, this.onTransactionCategorizationChanged)}
        <div>
          <Accordion
            defaultSelectedIndex={0}
            collapsible={true}
            multiple={false}
            items={[this.filteringOptionsAccordionItem]}
            selectedItems={this.state.selectedAccordionItems}
            itemTitleRender={(i: AccordionItemWrapper) => {
              return i.title;
            }}
            onSelectionChanged={this.accordionSelectionChanged}
            animationDuration={400}
            itemRender={() => {
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
            }}
          />
        </div>

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
          <Editing mode="row" allowUpdating={true} allowAdding={true}></Editing>
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} allowedPageSizes={[5, 10, 20, 100]} showInfo={true} />
          <Column
            dataField={'chaseTransaction.PostingDate'}
            caption="Posting Date"
            dataType="date"
            defaultSortOrder="desc"
            sortOrder="desc"
            width={95}
          />
          <Column dataField={'chaseTransaction.Description'} caption="Description" />
          <Column dataField={'categoryId'} caption="Category" dataType="string" width={100}>
            <Lookup dataSource={this.categoriesStore} valueExpr="categoryId" displayExpr="caption" />
          </Column>
          <Column dataField={'chaseTransaction.Amount'} caption="Amount" width={80} />
          <Column dataField={'chaseTransaction.Balance'} caption="Balance" width={80} />
        </DataGrid>
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
      </div>
    );
  }
}

export class TransactionContextMenuSource {
  store: CustomStore;
}

export default TransactionViewElement;
//
