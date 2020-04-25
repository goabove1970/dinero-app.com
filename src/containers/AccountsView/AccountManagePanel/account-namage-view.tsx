import React = require('react');
import { AccountResponseModel } from '../../../models/Account';
import Form, { SimpleItem, GroupItem, Label } from 'devextreme-react/form';
import 'devextreme-react/text-area';
import './account-manage-view.css';
import { Button } from 'devextreme-react';
import { inspect } from 'util';

interface AccountManageViewProps {
  account?: AccountResponseModel;
  onSave: (acc: AccountResponseModel) => void;
}

interface AccountManageViewState {
  account?: AccountResponseModel;
}

export class AccountManageViewElement extends React.Component<AccountManageViewProps, AccountManageViewState> {
  birthDateOptions: { width: string };
  positionOptions: { items: string[]; value: string };
  stateOptions: { items: string[] };
  phoneOptions: { mask: string };
  notesOptions: { height: number };
  constructor(props: AccountManageViewProps) {
    console.log(`Received acct in ctor: ${inspect(props.account)}`);
    super(props);
    this.state = {
      account: props.account
        ? {
            ...props.account,
          }
        : undefined,
    };

    this.birthDateOptions = { width: '100%' };

    this.phoneOptions = { mask: '+1 (000) 000-0000' };
    this.notesOptions = { height: 140 };
  }

  componentWillReceiveProps(nextProps: AccountManageViewProps) {
    console.log(`componentWillReceiveProps: ${inspect(nextProps)}`);
    this.setState({
      ...this.state.account,
      account: nextProps.account,
    });
  }

  render(): JSX.Element {
    console.log(`Account rendered: ${this.state.account}`);
    return (
      <div className="account-manage-content">
        <Form formData={this.state.account}>
          <GroupItem cssClass="first-group" colCount={4}>
            <GroupItem colSpan={2}>
              <SimpleItem label={{ text: 'Alias' }} dataField="alias" />
              <SimpleItem label={{ text: 'Bank' }} dataField="bankName" />
            </GroupItem>
            <GroupItem colSpan={2}>
              <SimpleItem label={{ text: 'Account ID' }} dataField="accountId" editorOptions={{ disabled: true }} />
              <SimpleItem
                label={{ text: 'Created' }}
                dataField="createDate"
                editorType="dxDateBox"
                editorOptions={{ ...this.birthDateOptions, disabled: true }}
              />
            </GroupItem>
          </GroupItem>
          <GroupItem cssClass="second-group" colCount={2}>
            <GroupItem>
              <SimpleItem label={{ text: 'Routing Number' }} dataField="bankRoutingNumber" />
              <SimpleItem label={{ text: 'Account Number' }} dataField="bankAccountNumber" />
              <SimpleItem label={{ text: 'Active' }} dataField="isAccountActive" />
              <SimpleItem label={{ text: 'Deactivated' }} dataField="isAccountDeactiveted" />
              <SimpleItem label={{ text: 'Locked' }} dataField="isAccountLocked" />
              <SimpleItem label={{ text: 'Deactivated' }} dataField="isAccountActivationPending" />
            </GroupItem>
            <GroupItem>
              <SimpleItem label={{ text: 'Card Number' }} dataField="cardNumber" />
              <SimpleItem
                label={{ text: 'Card Expiration' }}
                dataField="cardExpiration"
                editorType="dxDateBox"
                editorOptions={{ format: 'MM/yy' }}
              />
              <SimpleItem label={{ text: 'Credit' }} dataField="isCredit" />
              <SimpleItem label={{ text: 'Debit' }} dataField="isDebit" />
              <SimpleItem label={{ text: 'Savings' }} dataField="isSavings" />
              <SimpleItem label={{ text: 'Checking' }} dataField="isCheching" />
            </GroupItem>
            <SimpleItem
              colSpan={2}
              dataField="serviceComment"
              editorType="dxTextArea"
              editorOptions={this.notesOptions}
            />
          </GroupItem>
          <GroupItem cssClass="button-group" colCount={2}>
            <GroupItem>
              <Button
                text={'Save'}
                type={'default'}
                stylingMode="contained"
                onClick={() => {
                  if (this.state.account) {
                    this.props.onSave(this.state.account);
                  }
                }}
              />
            </GroupItem>
          </GroupItem>
        </Form>
      </div>
    );
  }
}

export default AccountManageViewElement;
