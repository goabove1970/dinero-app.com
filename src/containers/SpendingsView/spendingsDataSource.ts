import CustomStore from 'devextreme/data/custom_store';
import * as http from 'http';
import CONFIG from '../../config';
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
                parentCategories: data.categories,
                subCatgories: data.subCatgories,
              };

              const spendingProgression = data.spendingProgression.map((p: any) => {
                return {
                  ...p,
                  date: moment(p.date).toDate(),
                };
              });

              resolve({
                parentCategories: response.parentCategories,
                subCatgories: response.subCatgories,
                spendingProgression,
                spendingsByMonth: data.spendingsByMonth,
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
