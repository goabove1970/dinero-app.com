import CustomStore from 'devextreme/data/custom_store';
import * as http from 'http';
import CONFIG from '../config';
import { AccountStatus, AccountType, AccountResponseModel } from '../models/Account';

export interface AccountsRequestArgs {
  userId?: string;
}

export interface AccountUpdateArgs {
  accountId?: string;
  bankRoutingNumber?: number;
  bankAccountNumber?: number;
  bankName?: string;
  status?: AccountStatus;
  serviceComment?: string;
  accountType?: AccountType;
  cardNumber?: string;
  cardExpiration?: Date;
  alias?: string;
}

export const buildAccountsDataSource = (args: AccountsRequestArgs) => {
  return {
    store: new CustomStore({
      key: 'accountId',

      load: function () {
        // console.log(`loadOptions: ${JSON.stringify(args, null, 4)}`);
        const reqBody = {
          action: 'read-accounts',
          args: {
            userId: args.userId,
          },
        };
        const bodyString = JSON.stringify(reqBody);

        const options = {
          method: 'POST',
          hostname: CONFIG.serviceUrl,
          port: CONFIG.port,
          path: '/accounts',
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
              const response = {
                totalCount: data.payload.count,
                data: data.payload.accounts,
              };

              resolve(response);
            });
          });

          req.on('error', (err) => {
            console.error(`Error: ${err.message || err}`);
            reject(err);
          });

          // console.log(`Posting account request: ${bodyString}`);
          req.write(bodyString);
          req.end();
        });
      },

      update: function (key: any | string | number, values: AccountResponseModel) {
        // console.log(`updating account ${key} with value ${JSON.stringify(values, null, 4)}`);

        let status = 0;
        if (values.isAccountActive) {
          status |= AccountStatus.Active;
        }
        if (values.isAccountDeactiveted) {
          status |= AccountStatus.Deactivated;
        }
        if (values.isAccountLocked) {
          status |= AccountStatus.Locked;
        }
        if (values.isAccountActivationPending) {
          status |= AccountStatus.ActivationPending;
        }

        let type = 0;
        if (values.isCredit) {
          type |= AccountType.Credit;
        }
        if (values.isDebit) {
          type |= AccountType.Debit;
        }
        if (values.isCheching) {
          type |= AccountType.Checking;
        }
        if (values.isSavings) {
          type |= AccountType.Savings;
        }

        values.status = status;
        values.accountType = type;

        const reqBody = {
          action: 'update',
          args: {
            ...values,
            accountId: key,
          },
        };

        const bodyString = JSON.stringify(reqBody);
        // console.log(`Update transaction request: ${bodyString}`);

        const options = {
          method: 'POST',
          hostname: CONFIG.serviceUrl,
          port: CONFIG.port,
          path: '/accounts',
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

          console.log(`Posting update account request: ${bodyString}`);
          req.write(bodyString);
          req.end();
        });
      },
    }),
  };
};
