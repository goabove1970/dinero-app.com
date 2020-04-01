import * as React from 'react';
import * as http from 'http';
import * as moment from 'moment';

import 'devextreme/data/odata/store';
import DataGrid, { Column, Paging, Pager } from 'devextreme-react/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import 'whatwg-fetch';
import './transaction-view.css';
import { Button } from 'devextreme-react';
import notify from 'devextreme/ui/notify';
import { LoadingIndicator } from 'devextreme-react/bar-gauge';

interface loadResult {
  data: any[];
  totalCount: number;
}

const dataSource = (lo: any) => {
  return {
    store: new CustomStore({
      load: function() {
        console.log(`loadOptions: ${JSON.stringify(lo, null, 4)}`);
        const reqBody = {
          action: 'read-transactions',
          args: {
            accountId: 'dadcefdd-b198-08cf-b396-7cf044631d32',
            startDate: lo.userData.startDate,
            endDate: lo.userData.endDate,
          },
        };
        const bodyString = JSON.stringify(reqBody);

        const options = {
          method: 'POST',
          hostname: 'localhost',
          port: 9000,
          path: '/transactions',
          headers: {
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(bodyString),
          },
        };

        console.log(`request options: ${JSON.stringify(options, null, 4)}`);

        return new Promise((resolve, reject) => {
          const req = http.request(options, res => {
            let buffer: Buffer;
            res.on('data', (chunk: Buffer) => {
              if (!buffer) {
                buffer = chunk;
              } else {
                buffer = Buffer.concat([buffer, chunk]);
              }
            });

            res.on('end', () => {
              console.info(`Response: ${buffer}`);
              const data = JSON.parse(buffer.toString());
              const response: loadResult = {
                totalCount: data.payload.count,
                data: data.payload.transactions,
              };
              resolve(response);
            });
          });

          req.on('error', err => {
            console.error(`Error: ${err.message || err}`);
            reject(err);
          });

          console.log(`Posting request: ${bodyString}`);
          req.write(bodyString);
          req.end();
        });
      },
    }),
  };
};

export interface TransactionViewProps {
  accountId?: string;
}

export enum TransactionIntervalType {
  thisMonth,
  lastMonth,
  threeMonths,
  sixMonths,
  twelveMonths,
}

export interface TransactionIntervalSelectionOption {
  intervalType: TransactionIntervalType;
  caption: string;
  startDate: Date;
  endDate: Date;
}

const buildTransactionIntervalOption = (
  intervalType: TransactionIntervalType
): TransactionIntervalSelectionOption | undefined => {
  switch (intervalType) {
    case TransactionIntervalType.thisMonth: {
      return {
        intervalType,
        caption: 'This Month',
        startDate: moment()
          .startOf('month')
          .toDate(),
        endDate: moment().toDate(),
      };
    }
    case TransactionIntervalType.lastMonth: {
      return {
        intervalType,
        caption: '1 Month',
        startDate: moment()
          .subtract(1, 'month')
          .toDate(),
        endDate: moment().toDate(),
      };
    }
    case TransactionIntervalType.threeMonths: {
      return {
        intervalType,
        caption: '3 Months',
        startDate: moment()
          .subtract(3, 'month')
          .toDate(),
        endDate: moment().toDate(),
      };
    }
    case TransactionIntervalType.sixMonths: {
      return {
        intervalType,
        caption: '6 Months',
        startDate: moment()
          .subtract(6, 'month')
          .toDate(),
        endDate: moment().toDate(),
      };
    }
    case TransactionIntervalType.twelveMonths: {
      return {
        intervalType,
        caption: '1 Year',
        startDate: moment()
          .subtract(1, 'year')
          .toDate(),
        endDate: moment().toDate(),
      };
    }

    default:
      return undefined;
  }
};

const intervalButtons = [
  TransactionIntervalType.thisMonth,
  TransactionIntervalType.lastMonth,
  TransactionIntervalType.threeMonths,
  TransactionIntervalType.sixMonths,
  TransactionIntervalType.twelveMonths,
].map(m => buildTransactionIntervalOption(m));

const renderButtonsRow = (selectedInterval: TransactionIntervalType, onClick: any) => {
  return (
    <div className="buttons-demo">
      <div className="buttons">
        {intervalButtons.map(button => {
          return (
            <div>
              <div className="buttons-column">
                <div>
                  <Button
                    width={110}
                    text={button!.caption}
                    type={selectedInterval === button!.intervalType ? 'default' : 'normal'}
                    stylingMode="contained"
                    onClick={onClick}
                    elementAttr={button}
                    key={button!.intervalType}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export interface TransactionViewState {
  selectedIntervalType: TransactionIntervalType;
}

export class TransactionViewElement extends React.Component<TransactionViewProps, TransactionViewState> {
  constructor(props: TransactionViewProps) {
    super(props);
    console.log(`constructing DataGridElement for transactions from account '${props.accountId}'`);
    this.state = {
      selectedIntervalType: TransactionIntervalType.thisMonth,
    };
    this.onClick = this.onClick.bind(this);
  }

  onClick(e: any) {
    const selectedIntervalData = e.component.option('elementAttr') as TransactionIntervalSelectionOption;
    notify(`Requesting transactions for ${selectedIntervalData.caption}`);
    this.setState({
      ...this.state,
      selectedIntervalType: selectedIntervalData.intervalType,
    });
  }

  render(): JSX.Element {
    console.log('rendering DataGridElement');
    const intervalOption = buildTransactionIntervalOption(this.state.selectedIntervalType);
    return (
      <div className="transaction-content">
        <b>Transactions</b>
        <div className="sub-title">
          <div>Transactions for account {this.props.accountId}</div>
        </div>
        {renderButtonsRow(this.state.selectedIntervalType, this.onClick)}
        <DataGrid
          dataSource={dataSource({
            userData: {
              startDate: intervalOption!.startDate,
              endDate: intervalOption!.endDate,
            },
          })}
          columnAutoWidth={true}
          showBorders={true}
          showRowLines={true}
          selection={{ mode: 'single' }}
          hoverStateEnabled={true}
        >
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} allowedPageSizes={[5, 10, 20, 100]} showInfo={true} />
          <Column dataField={'transactionId'} caption="Transaction ID" />
          <Column dataField={'chaseTransaction.PostingDate'} caption="Posting Date" />
          <Column dataField={'chaseTransaction.Description'} caption="Description" />
          <Column dataField={'chaseTransaction.Amount'} caption="Amount" />
          <Column dataField={'chaseTransaction.Balance'} caption="Balance" />
        </DataGrid>
      </div>
    );
  }
}

export default TransactionViewElement;
