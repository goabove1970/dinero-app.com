import CustomStore from 'devextreme/data/custom_store';
import * as http from 'http';
import CONFIG from '../../config';

interface loadResult {
  data: any[];
  totalCount: number;
}

export interface BusinessRequestArgs {
  accountId: string;
}

export const buildBusinessDataSource = (args: BusinessRequestArgs) => {
  return {
    store: new CustomStore({
      load: function () {
        console.log(`loadOptions: ${JSON.stringify(args, null, 4)}`);
        const reqBody = {
          action: 'read',
          args: {
            accountId: args.accountId,
          },
        };
        const bodyString = JSON.stringify(reqBody);

        const options = {
          method: 'POST',
          hostname: CONFIG.serviceUrl,
          port: CONFIG.port,
          path: '/business',
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
                data: data.payload.businesses,
              };
              resolve(response);
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
    }),
  };
};
