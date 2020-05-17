import CustomStore from 'devextreme/data/custom_store';
import CONFIG from '../config';
import * as http from 'http';
import { topLevelCategoriesNodes } from './model';
import { inspect } from 'util';

export const categoriesReadDataSource = (userId?: string) => {
  return {
    store: new CustomStore({
      load: function (loadOptions) {
        const reqBody = {
          action: 'read',
          args: userId
            ? {
                userId,
              }
            : {},
        };
        const bodyString = JSON.stringify(reqBody);

        const options = {
          method: 'POST',
          hostname: CONFIG.serviceUrl,
          port: CONFIG.port,
          path: '/categories',
          headers: {
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(bodyString),
          },
        };

        console.log(`Categories request: ${inspect(options)}`);
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
              console.info(`Categories response: ${inspect(data)}`);
              const topLevel = topLevelCategoriesNodes(data.payload.categories);
              resolve(topLevel);
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
      key: 'categoryId',
    }),
  };
};
