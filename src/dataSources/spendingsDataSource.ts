import CustomStore from 'devextreme/data/custom_store';
import * as http from 'http';
import CONFIG from '../config';
import moment = require('moment');
import { inspect } from 'util';

export interface SpendingsRequestArgs {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  userId?: string;
  includeSubcategories?: boolean;
}

export const buildSpendingsDataSource = (args: SpendingsRequestArgs) => {
  return {
    store: new CustomStore({
      load: function () {
        const reqBody = {
          action: 'read',
          args: {
            userId: args.userId,
            startDate: args.startDate,
            endDate: args.endDate,
            includeSubcategories: true,
          },
        };
        const bodyString = JSON.stringify(reqBody);

        const options = {
          method: 'POST',
          hostname: CONFIG.serviceUrl,
          port: CONFIG.port,
          path: '/spendings',
          headers: {
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(bodyString),
          },
        };

        // console.log(`Spending request: ${inspect(options)}`);
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
              const data = JSON.parse(buffer.toString());
              // console.info(`Spendings response: ${inspect(data)}`);
              const response = {
                parentCategories: data.categories,
                subCatgories: data.subCatgories,
                annualBalances: data.annualBalances,
              };

              const spendingProgression = data.spendingProgression.map((p: any) => {
                return {
                  ...p,
                  date: moment(p.date).toDate(),
                };
              });

              const annual = data.annualBalances.map((t: any) => {
                return {
                  ...t,
                  month: moment(t.month).toDate(),
                  saldo: t.credit - t.debit,
                  cumDebit: 0,
                  cumCredit: 0,
                  cumSaldo: 0,
                };
              });
              // console.log(`Annual: ${inspect(annual)}`);
              // sort annual asc
              annual.sort((a1: any, a2: any) => {
                return moment(a1).isBefore(a2) ? -1 : 1;
              });
              let cumDebit = 0;
              let cumCredit = 0;
              let cumSaldo = 0;
              // console.log(`annual.lenth = ${annual.lenth}`);

              for (let i = 0; i < annual.length; ++i) {
                cumDebit += annual[i].debit;
                cumCredit += annual[i].credit;
                cumSaldo += annual[i].saldo;
                annual[i].cumDebit = cumDebit;
                annual[i].cumCredit = cumCredit;
                annual[i].cumSaldo = cumSaldo;
                console.log(`annual[${i}].cumDebit: ${inspect(cumDebit)}`);
              }
              // console.log(`Annual1: ${inspect(annual)}`);

              resolve({
                parentCategories: response.parentCategories,
                subCatgories: response.subCatgories,
                spendingProgression,
                spendingsByMonth: data.spendingsByMonth,
                annualBalances: annual,
              });
            });
          });

          req.on('error', (err) => {
            console.error(`Error: ${err.message || err}`);
            reject(err);
          });

          // console.log(`Posting spendings request: ${bodyString}`);
          req.write(bodyString);
          req.end();
        });
      },
    }),
  };
};
