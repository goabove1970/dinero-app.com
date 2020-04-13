import * as React from 'react';

import 'devextreme/data/odata/store';
import DataGrid, { Column, Paging, Editing, Pager, Lookup } from 'devextreme-react/data-grid';
import 'whatwg-fetch';
import './transaction-view.css';
import notify from 'devextreme/ui/notify';
import { buildTransactionDataSource } from './transactionDataSource';
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

export interface TransactionViewProps {
  accountId?: string;
}

export interface TransactionViewState {
  selectedIntervalType: TransactionIntervalType;
  selectedCategorizationType: TransactionCategorizationType;
}

export class TransactionViewElement extends React.Component<TransactionViewProps, TransactionViewState> {
  constructor(props: TransactionViewProps) {
    super(props);
    console.log(`constructing DataGridElement for transactions from account '${props.accountId}'`);
    this.state = {
      selectedIntervalType: TransactionIntervalType.all,
      selectedCategorizationType: 'all',
    };
    this.onTransactionIntervalChanged = this.onTransactionIntervalChanged.bind(this);
    this.onTransactionCategorizationChanged = this.onTransactionCategorizationChanged.bind(this);
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

  render(): JSX.Element {
    console.log('rendering DataGridElement');
    const intervalOption = buildTransactionIntervalOption(this.state.selectedIntervalType);
    return (
      <div className="transaction-content">
        <div>
          <b>Transactions</b>
          <div className="sub-title">
            <div>Transactions for account {this.props.accountId}</div>
          </div>
        </div>
        {renderIntervalButtonsRow(this.state.selectedIntervalType, this.onTransactionIntervalChanged)}
        {renderCategorizationButtonsRow(this.state.selectedCategorizationType, this.onTransactionCategorizationChanged)}
        <DataGrid
          dataSource={buildTransactionDataSource({
            startDate: intervalOption!.startDate,
            endDate: intervalOption!.endDate,
            categorization: this.state.selectedCategorizationType,
          })}
          columnAutoWidth={true}
          showBorders={true}
          showRowLines={true}
          selection={{ mode: 'single' }}
          hoverStateEnabled={true}
        >
          <Editing mode="row" allowUpdating={true} allowAdding={true}></Editing>
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} allowedPageSizes={[5, 10, 20, 100]} showInfo={true} />
          {/* <Column dataField={'transactionId'} caption="Transaction ID" /> */}

          <Column dataField={'chaseTransaction.PostingDate'} caption="Posting Date" dataType="date" width={95} />
          <Column dataField={'chaseTransaction.Description'} caption="Description" />

          <Column dataField={'categoryId'} caption="Category" dataType="string" width={100}>
            <Lookup
              dataSource={buildCategoriesDataSource(this.props.accountId)}
              valueExpr="categoryId"
              displayExpr="caption"
            />
          </Column>
          <Column dataField={'chaseTransaction.Amount'} caption="Amount" width={80} />
          <Column dataField={'chaseTransaction.Balance'} caption="Balance" width={80} />
        </DataGrid>
      </div>
    );
  }
}

export default TransactionViewElement;
