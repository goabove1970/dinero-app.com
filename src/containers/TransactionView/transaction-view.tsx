import * as React from 'react';

import 'devextreme/data/odata/store';
import DataGrid, { Column, Paging, Editing, Pager, Lookup } from 'devextreme-react/data-grid';
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
import DevExpress from 'devextreme/bundles/dx.all';
import { category, categoryTreeNode } from '../../contracts/categoryTreeNode';

export interface TransactionViewProps {
  accountId?: string;
  userId?: string;
}

export interface TransactionViewState {
  selectedIntervalType: TransactionIntervalType;
  selectedCategorizationType: TransactionCategorizationType;
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

  constructor(props: TransactionViewProps) {
    super(props);
    console.log(`constructing DataGridElement for transactions from account '${props.accountId}'`);
    this.state = {
      selectedIntervalType: TransactionIntervalType.all,
      selectedCategorizationType: 'all',
    };
    this.onTransactionIntervalChanged = this.onTransactionIntervalChanged.bind(this);
    this.onTransactionCategorizationChanged = this.onTransactionCategorizationChanged.bind(this);
    this.itemClick = this.itemClick.bind(this);
    this.contextMenuPerparing = this.contextMenuPerparing.bind(this);
    this.contectContentReady = this.contectContentReady.bind(this);
    this.contextMenuShowing = this.contextMenuShowing.bind(this);
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
    console.log(`itemClick: ${JSON.stringify(e.itemData, null, 4)}`);
    const selectedMenuItem: ContextMenuItem = e.itemData;
    const transaction =
      (this.selectedRowData && this.selectedRowData.row && this.selectedRowData.row.data) || undefined;
    if (!selectedMenuItem || !transaction) {
      return;
    }
    const transactionId = transaction.transactionId;
    const categoryId: string | undefined = selectedMenuItem.id;

    switch (selectedMenuItem.itemType) {
      case TransactionContextMenuItemType.moveToCategory: {
        console.log(`Moving transaction ${transactionId} to category ${categoryId}`);
        this.transactionsStore.store
          .update(transactionId, {
            categoryId,
          })
          .then(() => {
            if (this.selectedRowData && this.selectedRowData.component) {
              console.log(`Refreshing component...`);
              this.selectedRowData.component.refresh();
            }
          });
      }
      case TransactionContextMenuItemType.hideUnhide: {
        console.log(`Hiding/Unhiding transaction ${transactionId}`);
      }
    }
  }

  contectContentReady(e: any) {
    console.log(`contectContentReady, e.model: ${JSON.stringify(e.model, null, 4)}`);
    console.log(`contectContentReady, e.component.items: ${JSON.stringify(e.component.items, null, 4)}`);
  }

  contextMenuShowing(e: any) {
    // console.log(`contextMenuShowing, e.component: ${JSON.stringify(e.component, null, 4)}`);
    // e.component;
  }

  contextMenuPerparing(e: any) {
    // console.log(`contextMenuPerparing, e.row.data: ${JSON.stringify(e.row.data, null, 4)}`);
    this.selectedRowData = e;
  }

  render(): JSX.Element {
    const intervalOption = buildTransactionIntervalOption(this.state.selectedIntervalType);
    this.categoriesStore = buildCategoriesDataSource(this.props.userId, categoryReadTransformation);
    this.transactionsStore = buildTransactionDataSource({
      startDate: intervalOption!.startDate,
      endDate: intervalOption!.endDate,
      categorization: this.state.selectedCategorizationType,
    });
    const categoriesContextMenu = buildTransactionContextMenuSource(this.props.userId);
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
        <DataGrid
          dataSource={this.transactionsStore}
          columnAutoWidth={true}
          showBorders={true}
          showRowLines={true}
          selection={{ mode: 'single' }}
          hoverStateEnabled={true}
          onContextMenuPreparing={this.contextMenuPerparing}
        >
          <Editing mode="row" allowUpdating={true} allowAdding={true}></Editing>
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} allowedPageSizes={[5, 10, 20, 100]} showInfo={true} />
          {/* <Column dataField={'transactionId'} caption="Transaction ID" /> */}

          <Column dataField={'chaseTransaction.PostingDate'} caption="Posting Date" dataType="date" width={95} />
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
          onContentReady={this.contectContentReady}
          onShowing={this.contextMenuShowing}
        />
      </div>
    );
  }
}

export class TransactionContextMenuSource {
  store: CustomStore;
}

function buildTransactionContextMenuSource(userId?: string): TransactionContextMenuSource {
  const loadCategoriesSource = buildTransactionContextMenuDataSource(userId);

  const source: TransactionContextMenuSource = {
    store: new CustomStore({
      load: function (e: any): Promise<any> {
        return loadCategoriesSource.store.load().then((categories: ContextMenuItem[]) => {
          const newMenu: ContextMenuItem[] = [];
          newMenu.push({
            text: 'Hide Transaction',
            id: 'hide_unhide',
            itemType: TransactionContextMenuItemType.hideUnhide,
          });
          categories.forEach((c) => newMenu.push(c));
          return newMenu;
        });
      },
    }),
  };

  return source;
}

export default TransactionViewElement;
