import CustomStore from 'devextreme/data/custom_store';
import * as http from 'http';
import { TransactionCategorizationType } from './categorization';

interface loadResult {
  data: any[];
  totalCount: number;
}

export interface TransactionRequestArgs {
  startDate?: Date;
  endDate?: Date;
  categorization?: TransactionCategorizationType;
}

export const buildTransactionDataSource = (args: TransactionRequestArgs) => {
  return {
    store: new CustomStore({
      load: function() {
        console.log(`loadOptions: ${JSON.stringify(args, null, 4)}`);
        const reqBody = {
          action: 'read-transactions',
          args: {
            accountId: 'dadcefdd-b198-08cf-b396-7cf044631d32',
            startDate: args.startDate,
            endDate: args.endDate,
            categorization: args.categorization,
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
