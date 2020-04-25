import * as React from 'react';

import 'devextreme/data/odata/store';
import DataGrid, { Column, Paging, Editing, Pager, Lookup, Sorting } from 'devextreme-react/data-grid';
import 'whatwg-fetch';
import './accounts-view.css';
import { buildAccountsDataSource } from '../../dataSources/accountsDataSource';
import CustomStore from 'devextreme/data/custom_store';
import AccountManageViewElement from './AccountManagePanel';
import { AccountResponseModel } from '../../models/Account';
import { inspect } from 'util';

interface AccountsViewProps {
  userId?: string;
}

interface AccountsViewState {
  selectedAccount?: AccountResponseModel;
}

export class AccountsViewElement extends React.Component<AccountsViewProps, AccountsViewState> {
  accStore: { store: CustomStore };

  constructor(props: AccountsViewProps) {
    super(props);

    this.state = {};
    this.selectedAccountChanged = this.selectedAccountChanged.bind(this);
  }

  selectedAccountChanged(e: any) {
    this.setState({
      ...this.state,
      selectedAccount:
        (e.selectedRowsData && e.selectedRowsData.length && e.selectedRowsData.length > 0 && e.selectedRowsData[0]) ||
        undefined,
    });
    // console.log(`selectedAccountChanged, e: ${inspect(e)}`);
  }

  render(): JSX.Element {
    this.accStore = buildAccountsDataSource({
      userId: this.props.userId,
    });
    console.log(`Selected acct: ${inspect(this.state.selectedAccount)}`);
    return (
      <div className="account-content">
        <div>
          <b>Accounts</b>
          <div className="sub-title">
            <div>Accounts for user {this.props.userId}</div>
          </div>
        </div>

        <DataGrid
          dataSource={this.accStore}
          columnAutoWidth={true}
          showBorders={true}
          showRowLines={true}
          selection={{ mode: 'single' }}
          hoverStateEnabled={true}
          onSelectionChanged={this.selectedAccountChanged}
          selectedRowKeys={this.state.selectedAccount ? [this.state.selectedAccount.accountId] : []}
        >
          <Sorting></Sorting>
          {/* <Editing mode="row" allowUpdating={true} allowAdding={true}></Editing> */}
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} allowedPageSizes={[5, 10, 20, 100]} showInfo={true} />
          <Column
            dataField={'createDate'}
            caption="Created"
            dataType="date"
            defaultSortOrder="desc"
            sortOrder="desc"
            width={95}
          />
          <Column dataField={'alias'} caption="Name" width={300} />
          <Column dataField={'bankName'} caption="Bank" width={200} />
          {/* <Column dataField={'bankRoutingNumber'} caption="Routing" width={80} /> */}
          {/* <Column dataField={'bankAccountNumber'} caption="Account" width={80} /> */}
          {/* <Column dataField={'cardNumber'} caption="Card" width={80} /> */}
          {/* <Column dataField={'cardExpiration'} caption="Expiration" dataType="date" width={95} format={'MM/yy'} /> */}
        </DataGrid>
        {this.state.selectedAccount && (
          <AccountManageViewElement
            account={this.state.selectedAccount}
            onSave={(acc: AccountResponseModel) => {
              this.accStore.store.update(acc.accountId, acc);
              this.selectedAccountChanged([this.state.selectedAccount]);
            }}
          />
        )}
      </div>
    );
  }
}

export default AccountsViewElement;
