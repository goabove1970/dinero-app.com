import CustomStore from 'devextreme/data/custom_store';
import * as http from 'http';
import { categoryTreeNode, category } from '../contracts/categoryTreeNode';
import CONFIG from '../config';
// import { inspect } from 'util';

function dropOrphanCategoriesAndLoops(cats: category[]): category[] {
  const res = cats.filter((c) => !isOrphanOrLooped(cats, c));

  return res;
}

function isOrphanOrLooped(cats: category[], cat: category): boolean {
  let parentId = cat.parentCategoryId;
  const hits: string[] = [];
  hits.push(cat.categoryId);
  while (parentId !== undefined) {
    const el = cats.findIndex((c) => c.categoryId === parentId);
    if (el === -1) {
      // cannot find parent with such parent id
      return true;
    }
    const parent = cats[el];
    if (hits.findIndex((e) => e === parent.categoryId) !== -1) {
      // loop, current node id has already beed added to the path
      return true;
    }

    parentId = parent.parentCategoryId;
    hits.push(parentId);
  }

  return false;
}

export function buildTreeShape(cats: category[]): categoryTreeNode[] {
  // console.log(`entry: ${inspect(cats)}`);
  cats = dropOrphanCategoriesAndLoops(cats);
  // console.log(`dropOrphanCategoriesAndLoops: ${inspect(cats)}`);
  const tree: categoryTreeNode[] = [];
  const catMap: Map<string, categoryTreeNode> = new Map<string, categoryTreeNode>();
  const discoveredCategories: string[] = [];
  cats
    .filter((c) => c.parentCategoryId === undefined)
    .map((c) => {
      c.addedToTree = true;
      return {
        caption: c.caption,
        categoryId: c.categoryId,
        key: c.categoryId,
        parentCategoryId: c.parentCategoryId,
        items: [],
      } as categoryTreeNode;
    })
    .forEach((c: categoryTreeNode) => {
      catMap.set(c.categoryId, c);
      tree.push(c);
      discoveredCategories.push(c.categoryId);
    });

  while (cats.some((c) => c.addedToTree !== true)) {
    cats
      .filter((c) => c.addedToTree !== true)
      .forEach((c) => {
        if (catMap.has(c.parentCategoryId)) {
          const node = catMap.get(c.parentCategoryId);
          const newNode = {
            caption: c.caption,
            categoryId: c.categoryId,
            key: c.categoryId,
            parentCategoryId: c.parentCategoryId,
            items: [],
          } as categoryTreeNode;
          node!.items.push(newNode);
          discoveredCategories.push(newNode.categoryId);
          catMap.set(newNode.categoryId, newNode);
          c.addedToTree = true;
        }
      });
  }

  return tree;
}

export const buildCategoriesDataSource = (userId?: string, readTransformation?: (cats: category[]) => any[]) => {
  return {
    store: new CustomStore({
      key: 'categoryId',

      byKey: function (key: any | string | number) {
        console.log(`calling byKey on category data source for key ${key}`);
        const reqBody = {
          action: 'read',
          args: {
            categoryId: key,
          },
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
              if (data.payload.categories && data.payload.categories.length) {
                resolve(data.payload.categories[0]);
              } else {
                resolve(undefined);
              }
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

      load: function (loadOptions: any) {
        const reqBody = {
          action: 'read',
          args: {
            userId,
          },
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

        // console.log(`category request options: ${JSON.stringify(options, null, 4)}`);

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
              // console.info(`data: ${buffer}`);
              if (!readTransformation) {
                readTransformation = buildTreeShape;
              }
              // console.info(`transforming: ${inspect(data.payload.categories)}`);
              const transformed = readTransformation(data.payload.categories);
              // console.log(`Category transformed data: ${inspect(transformed)}`);
              resolve(transformed);
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

      update: function (key: any | string | number, values: { caption: string; icon: string }) {
        //console.log(`updating with value ${JSON.stringify(values, null, 4)}`);
        const reqBody = {
          action: 'update',
          args: {
            categoryId: key,
            caption: values.caption,
            icon: values.icon,
          },
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

        //  console.log(`request options: ${JSON.stringify(options, null, 4)}`);

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

          //  console.log(`Posting request: ${bodyString}`);
          req.write(bodyString);
          req.end();
        });
      },

      insert: function (cat: categoryTreeNode): Promise<any> | JQueryPromise<any> {
        console.log(`Inserting elements: ${JSON.stringify(cat)}`);
        const reqBody = {
          action: 'create',
          args: {
            userId,
            caption: cat.caption,
            categoryType: 2, // user defined
            parentCategoryId: cat.parentCategoryId,
          },
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
            console.error(`Error inserting category: ${err.message || err}`);
            reject(err);
          });

          console.log(`Posting request: ${bodyString}`);
          req.write(bodyString);
          req.end();
        });
      },

      remove: function (key: any | string | number): Promise<any> | JQueryPromise<any> {
        // console.log(`deleting elements: ${JSON.stringify(key)}`);
        const reqBody = {
          action: 'delete',
          args: {
            categoryId: key,
          },
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
            console.error(`Error deleting category: ${err.message || err}`);
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
