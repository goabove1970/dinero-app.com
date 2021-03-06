import CustomStore from 'devextreme/data/custom_store';
import * as http from 'http';
import { TransactionCategorizationType } from '../common/categorization';
import CONFIG from '../../config';

interface loadResult {
  data: any[];
  totalCount: number;
}

export interface TransactionRequestArgs {
  startDate?: Date;
  endDate?: Date;
  categorization?: TransactionCategorizationType;
  showHidden?: boolean;
  showExcluded?: boolean;
  accountId?: string;
  userId?: string;
  categoryId?: string;
  transactionSearchPattern?: string;
}

export const buildTransactionDataSource = (args: TransactionRequestArgs) => {
  return {
    store: new CustomStore({
      key: 'transactionId',

      byKey: (key: any | string | number) => {
        // console.log(`calling byKey on transaction data source for key ${key}`);
        // console.log(`loadOptions: ${JSON.stringify(args, null, 4)}`);
        const reqBody = {
          action: 'read-transactions',
          args: {
            transactionId: key,
          },
        };
        const bodyString = JSON.stringify(reqBody);

        const options = {
          method: 'POST',
          hostname: CONFIG.serviceUrl,
          port: CONFIG.port,
          path: '/transactions',
          headers: {
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(bodyString),
          },
        };

        // console.log(`request options: ${JSON.stringify(options, null, 4)}`);

        return new Promise((resolve, reject) => {
          const req = http.request(options, (res) => {
            let buffer: Buffer;
            res.on('data', (chunk: Buffer) => {
              if (!buffer) {
                buffer = chunk;
              } else {
                buffer = Buffer.concat([buffer, chunk]);
              }
            });

            res.on('end', () => {
              // console.info(`Response: ${buffer}`);
              const data = JSON.parse(buffer.toString());
              const response: loadResult = {
                totalCount: data.payload.count,
                data: data.payload.transactions,
              };
              if (response.data && response.data.length) {
                resolve(response.data[0]);
              }
              resolve(undefined);
            });
          });

          req.on('error', (err) => {
            console.error(`Error: ${err.message || err}`);
            reject(err);
          });

          console.log(`Posting request: ${bodyString}`);
          req.write(bodyString);
          req.end();
        });
      },

      load: function () {
        console.log(`loadOptions: ${JSON.stringify(args, null, 4)}`);
        const reqBody: any = {
          action: 'read-transactions',
          args: {
            // accountId: 'dadcefdd-b198-08cf-b396-7cf044631d32',
            startDate: args.startDate,
            endDate: args.endDate,
            categorization: args.categorization,
            categoryId: args.categoryId,
            filter: args.transactionSearchPattern,
          },
        };

        if (args.transactionSearchPattern === undefined) {
          delete reqBody.args.filter;
        }

        if (args.accountId) {
          reqBody.args = { ...reqBody.args, accountId: args.accountId };
        } else if (args.userId) {
          reqBody.args = { ...reqBody.args, userId: args.userId };
        }
        const bodyString = JSON.stringify(reqBody);

        const options = {
          method: 'POST',
          hostname: CONFIG.serviceUrl,
          port: CONFIG.port,
          path: '/transactions',
          headers: {
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(bodyString),
          },
        };

        // console.log(`request transactions options: ${JSON.stringify(options, null, 4)}`);

        return new Promise((resolve, reject) => {
          const req = http.request(options, (res) => {
            let buffer: Buffer;
            res.on('data', (chunk: Buffer) => {
              if (!buffer) {
                buffer = chunk;
              } else {
                buffer = Buffer.concat([buffer, chunk]);
              }
            });

            res.on('end', () => {
              // console.info(`Response: ${buffer}`);
              const data = JSON.parse(buffer.toString());
              const response: loadResult = {
                totalCount: data.payload.count,
                data: data.payload.transactions,
              };
              if (args.showHidden === false) {
                response.data = response.data.filter((t) => !t.isHidden);
              }
              if (args.showExcluded === false) {
                response.data = response.data.filter((t) => !t.isExcluded);
              }
              resolve(response);
            });
          });

          req.on('error', (err) => {
            console.error(`Error: ${err.message || err}`);
            reject(err);
          });

          // console.log(`Posting transaction request: ${bodyString}`);
          req.write(bodyString);
          req.end();
        });
      },

      update: function (key: any | string | number, values: { categoryId?: string; statusModification?: string }) {
        // console.log(`updating transaction ${key} with value ${JSON.stringify(values, null, 4)}`);
        const reqBody = {
          action: 'update',
          args: {
            categoryId: values.categoryId,
            statusModification: values.statusModification,
            transactionId: key,
          },
        };
        const bodyString = JSON.stringify(reqBody);
        // console.log(`Update transaction request: ${bodyString}`);

        const options = {
          method: 'POST',
          hostname: CONFIG.serviceUrl,
          port: CONFIG.port,
          path: '/transactions',
          headers: {
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(bodyString),
          },
        };

        // console.log(`request options: ${JSON.stringify(options, null, 4)}`);

        return new Promise((resolve, reject) => {
          const req = http.request(options, (res) => {
            let buffer: Buffer;
            res.on('data', (chunk: Buffer) => {
              if (!buffer) {
                buffer = chunk;
              } else {
                buffer = Buffer.concat([buffer, chunk]);
              }
            });

            res.on('end', () => {
              const responseData = buffer.toString();
              // console.info(`Response: ${JSON.stringify(responseData)}`);
              resolve(responseData);
            });
          });

          req.on('error', (err) => {
            console.error(`Error: ${err.message || err}`);
            reject(err);
          });

          // console.log(`Posting request: ${bodyString}`);
          req.write(bodyString);
          req.end();
        });
      },
    }),
  };
};
