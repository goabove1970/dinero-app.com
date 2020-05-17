import * as React from 'react';
import './bank-connections.css';
import {
  LoadIndicator,
  TextArea,
  CheckBox,
  Button,
  Popup,
  TextBox,
  Validator,
  ValidationSummary,
} from 'devextreme-react';

import ArrayStore from 'devextreme/data/array_store';
import List from 'devextreme-react/list';
import bankConrtoller from './bankDataSource';
import { BankConnectionResponse, BankConnection } from '../../models/BankConnections';
import { inspect } from 'util';
import moment = require('moment');
import { RequiredRule } from 'devextreme-react/validator';
import notify from 'devextreme/ui/notify';

export interface BankConnectionsViewProps {
  userId: string;
}

export interface BankConnectionsViewState {
  dataLoaded?: boolean;
  data: BankConnection[];
  dataLoadFailed?: boolean;
  popupVisible?: any;
  currentConnection?: BankConnection;
  selectedItemKeys?: string[];
  addConnPopupVisible?: boolean;
  yesNoPopupVisible?: boolean;
  yesModalAction?: () => void;
  modalMessage?: string;
  modalHeader?: string;
  addConnBank?: string;
  addBankUserName?: string;
  addBankPassword?: string;
  dataSourceOptions?: any;
  bankValidationInProgress?: boolean;
  bankValidationComplete?: boolean;
  bankError?: string;
  addButtonText?: string;
  syncInProgress?: boolean;
}

const listAttrs = { class: 'list' };
const ADD_BANK_ID = 'add_new_bank';

export class BankConnectionsViewElement extends React.Component<BankConnectionsViewProps, BankConnectionsViewState> {
  constructor(props: BankConnectionsViewProps) {
    super(props);
    // console.log(`constructing DataGridElement for business for account '${props.userId}'`);
    this.state = {
      data: [],
    };

    this.handleListSelectionChange = this.handleListSelectionChange.bind(this);
    this.showAddConnPopup = this.showAddConnPopup.bind(this);
    this.hideAddConnPopup = this.hideAddConnPopup.bind(this);
    this.showYesNoPopup = this.showYesNoPopup.bind(this);
    this.hideYesNoPopup = this.hideYesNoPopup.bind(this);
  }

  reloadBankConnections() {
    // console.log('reloadBankConnections');
    bankConrtoller.readBankConnections(this.props.userId).then((responseData: BankConnectionResponse) => {
      if (responseData.error || responseData.errorCode) {
        this.setState({ ...this.state, dataLoadFailed: true });
      } else {
        // console.log(`Loaded bank connections: ${inspect(responseData.payload)}`);
        const connections = (responseData.payload && responseData.payload.connections) || [];
        connections.push({
          bankName: 'chase',
          //bankCategory: 'Add New Bank',
          bankFullName: 'Add New Bank',
          connectionId: 'add_new_bank',
        });
        this.setState({
          ...this.state,
          dataLoaded: true,
          data: connections,
          addButtonText: 'Add Bank',
          currentConnection: connections.length > 0 ? connections[0] : undefined,
          selectedItemKeys: connections.length > 0 ? [connections[0].connectionId!] : [],
          dataSourceOptions: {
            store: new ArrayStore({
              data: connections,
              key: 'connectionId',
            }),
            group: 'bankCategory',
            searchExpr: ['bankName', 'bankCategory', 'bankFullName', 'connectionId', 'login'],
          },
        });
      }
    });
  }

  handleListSelectionChange(e: any) {
    // console.log(`handleListSelectionChange: ${inspect(e)}`);
    const currentConnection: BankConnection = e.addedItems[0];
    this.setState({
      ...this.state,
      currentConnection,
      selectedItemKeys: currentConnection && currentConnection.connectionId ? [currentConnection.connectionId!] : [],
    });
  }

  componentDidMount() {
    this.reloadBankConnections();
  }

  renderBankDetails(conn: BankConnection): JSX.Element {
    return (
      <div>
        <div className="header">
          <div className="name-container">
            <div className="name">{conn.bankFullName}</div>
            <div>Login {conn.login}</div>
          </div>
        </div>

        <div>Added on {moment(conn.dateAdded).format('LL')}</div>
        {this.state.syncInProgress ? (
          <div>
            Synchronizing bank data...
            <LoadIndicator id="large-indicator" height={80} width={80}></LoadIndicator>
          </div>
        ) : (
          <div>
            <div>Last time syncronized {moment(conn.lastPollDate).fromNow()}</div>
            {conn.isConnectionActive && (
              <div>
                <CheckBox value={conn.isConnectionActive} readOnly={true} text={'Active'} />
              </div>
            )}
            {conn.isBankActivationRequired && (
              <div>
                <CheckBox value={conn.isBankActivationRequired} readOnly={true} text={'Bank Activation Is Required'} />
              </div>
            )}
            {conn.isCouldNotConnect && (
              <div>
                <CheckBox value={conn.isCouldNotConnect} readOnly={true} text={'Could Not Connect'} />
              </div>
            )}
            {conn.isSuspended && (
              <div>
                <CheckBox value={conn.isSuspended} readOnly={true} text={'Suspended'} />
              </div>
            )}
            {conn.isValidated && (
              <div>
                <CheckBox value={conn.isValidated} readOnly={true} text={'Validated'} />
              </div>
            )}
            <div>
              Last sync sessions statistics:
              <TextArea height={300} value={JSON.stringify(conn.lastPollStats, null, 4)} />
            </div>
            <div>
              <Button
                text={'Delete Bank Connection'}
                type={'default'}
                stylingMode="contained"
                onClick={() => {
                  // console.log('Calling this.showYesNoPopup');
                  this.showYesNoPopup(
                    'Do you want to delete bank connection?',
                    () => {
                      this.deleteBankConnection();
                    },
                    'Bank Connection'
                  );
                }}
              />
              <Button
                text={'Sync'}
                type={'default'}
                stylingMode="contained"
                onClick={() => {
                  // console.log('Calling this.showYesNoPopup');
                  this.showYesNoPopup(
                    'Do you want to sync bank connection?',
                    () => {
                      this.syncBankConnection();
                    },
                    'Bank Connection'
                  );
                }}
              />
            </div>
            {/* <div className="description">{JSON.stringify(conn.lastPollStats, null, 4)}</div> */}
          </div>
        )}
      </div>
    );
  }

  renderAddBanksSheet(): JSX.Element {
    // console.log('renderAddBanksSheet');
    return (
      <Button
        text={'Chase'}
        type={'default'}
        stylingMode="contained"
        onClick={() => {
          this.showAddConnPopup('chase');
        }}
      />
    );
  }

  renderRightSide(conn: BankConnection): JSX.Element {
    return (
      <div className="right">
        {conn.connectionId === 'add_new_bank' ? this.renderAddBanksSheet() : this.renderBankDetails(conn)}
      </div>
    );
  }

  showAddConnPopup(bank?: string) {
    // console.log('showAddConnPopup');
    this.setState({
      ...this.state,
      addConnPopupVisible: true,
      addConnBank: bank,
    });
  }

  hideAddConnPopup() {
    this.setState({
      ...this.state,
      addConnPopupVisible: false,
      addConnBank: undefined,
      addBankUserName: undefined,
      addBankPassword: undefined,
      bankValidationComplete: undefined,
      bankValidationInProgress: undefined,
      bankError: undefined,
    });
  }
  hideYesNoPopup() {
    this.setState({
      ...this.state,
      yesNoPopupVisible: false,
      yesModalAction: undefined,
      modalMessage: undefined,
      modalHeader: undefined,
    });
  }
  showYesNoPopup(message?: string, action?: () => void, header?: string) {
    console.log('Showing yew/no popup');
    this.setState({
      ...this.state,
      yesNoPopupVisible: true,
      modalMessage: message,
      yesModalAction: action,
      modalHeader: header,
    });
  }

  onAddBankConnecion() {
    if (!this.state.addBankUserName || !this.state.addBankPassword || !this.state.addConnBank) {
      return;
    }

    this.setState({
      ...this.state,
      addButtonText: 'Adding Bank',
      bankValidationInProgress: true,
      bankError: undefined,
    });

    bankConrtoller
      .addBankConnection(
        this.props.userId,
        this.state.addBankUserName!,
        this.state.addBankPassword!,
        this.state.addConnBank!
      )
      .then((responseData: BankConnectionResponse) => {
        if (responseData.error || responseData.errorCode) {
          this.setState({
            ...this.state,
            bankError: responseData.error,
            bankValidationComplete: false,
            bankValidationInProgress: false,
          });
        } else {
          if (responseData.payload && responseData.payload.bankSeverity === 'ERROR') {
            let message = responseData.payload.bankMessage;
            switch (message) {
              case 'INVALID ID/PASSWORD':
                message = 'Invalid Login or Password';
                break;
            }
            this.setState({
              ...this.state,
              bankError: message,
              bankValidationComplete: false,
              bankValidationInProgress: false,
            });
          }

          console.log(`Added bank connection: ${inspect(responseData.payload)}`);
          this.setState({ ...this.state, bankValidationComplete: true });
          this.reloadBankConnections();
        }
      });
  }

  deleteBankConnection() {
    if (
      !this.state.currentConnection ||
      !this.state.currentConnection.connectionId ||
      this.state.currentConnection.connectionId === ADD_BANK_ID
    ) {
      return;
    }

    this.hideYesNoPopup();

    bankConrtoller
      .deleteBankConnection(this.state.currentConnection.connectionId)
      .then((responseData: BankConnectionResponse) => {
        if (responseData.error || responseData.errorCode) {
          this.setState({
            ...this.state,
            bankError: responseData.error,
          });
        } else {
          if (responseData.payload && responseData.payload.bankSeverity === 'ERROR') {
            let message = responseData.payload.bankMessage;
            switch (message) {
              case 'INVALID ID/PASSWORD':
                message = 'Invalid Login or Password';
                break;
            }
            this.setState({
              ...this.state,
              bankError: message,
            });
          }

          console.log(`Deleted bank connection: ${inspect(responseData.payload)}`);
          this.setState({ ...this.state });
          this.reloadBankConnections();
        }
      });
  }

  syncBankConnection() {
    if (
      !this.state.currentConnection ||
      !this.state.currentConnection.connectionId ||
      this.state.currentConnection.connectionId === ADD_BANK_ID
    ) {
      return;
    }

    this.hideYesNoPopup();

    this.setState({ ...this.state, syncInProgress: true });

    bankConrtoller
      .syncBankConnection(this.state.currentConnection.connectionId)
      .then((responseData: BankConnectionResponse) => {
        if (responseData.error || responseData.errorCode) {
          this.setState({
            ...this.state,
            bankError: responseData.error,
            syncInProgress: false,
          });
        } else {
          if (responseData.payload && responseData.payload.bankSeverity === 'ERROR') {
            let message = responseData.payload.bankMessage;
            switch (message) {
              case 'INVALID ID/PASSWORD':
                message = 'Invalid Login or Password';
                break;
            }
            this.setState({
              ...this.state,
              bankError: message,
              syncInProgress: false,
            });
          }

          console.log(`Synced bank connection: ${inspect(responseData.payload)}`);
          this.setState({ ...this.state, syncInProgress: false, bankError: undefined });
          notify('Successfully synchronized bank connection.', 'success', 3000);
          this.reloadBankConnections();
        }
      });
  }

  renderAddConnectionPopup(): JSX.Element {
    return (
      <Popup
        visible={this.state.addConnPopupVisible}
        onHiding={this.hideAddConnPopup}
        dragEnabled={false}
        closeOnOutsideClick={true}
        showTitle={true}
        title="Add New Bank"
        width={300}
        height={300}
      >
        <div className="dx-field">
          <div className="inputField">
            <TextBox
              mode="text"
              placeholder="Enter login"
              value={this.state.addBankUserName}
              onValueChanged={(args) => {
                this.setState({ ...this.state, addBankUserName: args.value });
              }}
            >
              <Validator>
                <RequiredRule message="Login is required" />
              </Validator>
            </TextBox>
          </div>
        </div>

        <div className="dx-field">
          <div className="inputField">
            <TextBox
              mode="password"
              placeholder="Enter password"
              showClearButton={true}
              value={this.state.addBankPassword}
              onValueChanged={(args) => {
                this.setState({ ...this.state, addBankPassword: args.value });
              }}
            >
              <Validator>
                <RequiredRule message="Password is required" />
              </Validator>
            </TextBox>
          </div>
        </div>

        <div className="dx-fieldset">
          <ValidationSummary id="summary"></ValidationSummary>
          {!this.state.bankValidationComplete && (
            <Button
              id="buttonAdd"
              width={180}
              height={40}
              onClick={() => {
                this.onAddBankConnecion();
              }}
            >
              <LoadIndicator className="button-indicator" visible={this.state.bankValidationInProgress} />
              <span className="dx-button-text">{this.state.addButtonText}</span>
            </Button>
          )}
          {this.state.bankError && <div>{this.state.bankError}</div>}
          {this.state.bankValidationComplete && (
            <Button
              id="buttonClose"
              text="Close"
              width={180}
              height={40}
              onClick={() => {
                this.hideAddConnPopup();
              }}
            />
          )}
        </div>
      </Popup>
    );
  }

  renderYesNoPopup(): JSX.Element {
    console.log(`Rendering renderYesNoPopup`);
    return (
      <Popup
        visible={this.state.yesNoPopupVisible}
        onHiding={this.hideYesNoPopup}
        dragEnabled={false}
        closeOnOutsideClick={true}
        showTitle={true}
        title={this.state.modalHeader}
        width={300}
        height={300}
      >
        <div>{this.state.modalMessage}</div>
        <Button
          id="buttonYes"
          text="Yes"
          width={180}
          height={40}
          onClick={() => {
            if (this.state.yesModalAction) {
              this.state.yesModalAction();
            }
          }}
        />
        <Button
          id="buttonYes"
          text="No"
          width={180}
          height={40}
          onClick={() => {
            this.hideYesNoPopup();
          }}
        />
      </Popup>
    );
  }

  render(): JSX.Element {
    const currentConnection = this.state.currentConnection;

    // console.log(`this.state.data: ${inspect(this.state.data)}`);
    // const store = buildCategoriesDataSource(this.props.userId);
    // this.customStore = store.store;

    console.log(`this.state.selectedItemKeys (${inspect(this.state.selectedItemKeys)}`);
    return (
      <div className="bank-connections-content">
        <div className="caption">Bank Connections</div>
        {!this.state.dataLoaded ? (
          <LoadIndicator id="large-indicator" height={80} width={80}></LoadIndicator>
        ) : (
          <div>
            <div className="left">
              {this.renderYesNoPopup()}
              {this.renderAddConnectionPopup()}

              <List
                selectionMode="single"
                dataSource={this.state.dataSourceOptions}
                grouped={true}
                searchEnabled={true}
                selectedItemKeys={this.state.selectedItemKeys}
                onSelectionChanged={this.handleListSelectionChange}
                itemRender={renderListItem}
                groupRender={renderListGroup}
                elementAttr={listAttrs}
              />
            </div>
            {currentConnection && this.renderRightSide(currentConnection)}
          </div>
        )}
      </div>
    );
  }
}

function renderListGroup(group: any) {
  return <div className="bankFullName">{group.key}</div>;
}

function renderListItem(item: BankConnection) {
  return (
    <div>
      <div className="hotel">
        <div className="name">{item.bankFullName}</div>
        {/* <div className="address">{`${item.connectionId}`}</div> */}
      </div>
    </div>
  );
}

export default BankConnectionsViewElement;
