import * as React from 'react';
import * as http from 'http';

import 'devextreme/data/odata/store';
import DataGrid, { Column, Paging, Pager } from 'devextreme-react/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import 'whatwg-fetch';
import './transaction-view.css';

interface loadResult {
  data: any[];
  totalCount: number;
}

const dataSource = {
  store: new CustomStore({
    load: function(loadOptions) {
      const reqBody = {
        action: 'read-transactions',
        args: {
          accountId: 'dadcefdd-b198-08cf-b396-7cf044631d32',
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

export interface TransactionViewProps {
  accountId?: string;
}

export class TransactionViewElement extends React.Component<TransactionViewProps> {
  constructor(props: TransactionViewProps) {
    super(props);
    console.log(`constructing DataGridElement for transactions from account '${props.accountId}'`);
  }

  render(): JSX.Element {
    console.log('rendering DataGridElement');
    return (
      <div className="transaction-content">
        <b>Transactions</b>
        <div className="sub-title">
          <div>Transactions for account {this.props.accountId}</div>
        </div>
        <DataGrid
          dataSource={dataSource}
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
