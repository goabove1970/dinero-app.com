import * as React from 'react';
import * as http from 'http';

import 'devextreme/data/odata/store';
import { TreeList, Column, Editing, ValidationRule, Lookup } from 'devextreme-react/tree-list';
import CustomStore from 'devextreme/data/custom_store';

// import DataGrid, { Column, Paging, Pager } from 'devextreme-react/data-grid';
// import CustomStore from 'devextreme/data/custom_store';
import 'whatwg-fetch';
import './category-view.css';

const popupOptions = {
  title: 'Employee Info',
  showTitle: true,
  width: 700,
  position: { my: 'top', at: 'top', of: window },
};

interface loadResult {
  data: any[];
  totalCount: number;
}

interface category {
  caption: string;
  categoryId: string;
  parentCategoryId: string;
  addedToTree?: boolean;
}

export interface categoryTreeNode {
  caption: string;
  categoryId: string;
  parentCategoryId?: string;
  key: string;
  items: categoryTreeNode[];
}

function dropOrphanCategoriesAndLoops(cats: category[]): category[] {
  const res = cats.filter(c => !isOrphanOrLooped(cats, c));

  return res;
}

function isOrphanOrLooped(cats: category[], cat: category): boolean {
  let parentId = cat.parentCategoryId;
  const hits: string[] = [];
  hits.push(cat.categoryId);
  while (parentId !== undefined) {
    const el = cats.findIndex(c => c.categoryId === parentId);
    if (el === -1) {
      // cannot find parent with such parent id
      return true;
    }
    const parent = cats[el];
    if (hits.findIndex(e => e === parent.categoryId) !== -1) {
      // loop, current node id has already beed added to the path
      return true;
    }

    parentId = parent.parentCategoryId;
    hits.push(parentId);
  }

  return false;
}

function buildTreeShape(cats: category[]): categoryTreeNode[] {
  cats = dropOrphanCategoriesAndLoops(cats);
  const tree: categoryTreeNode[] = [];
  const catMap: Map<string, categoryTreeNode> = new Map<string, categoryTreeNode>();
  const discoveredCategories: string[] = [];
  cats
    .filter(c => c.parentCategoryId === undefined)
    .map(c => {
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

  while (cats.some(c => c.addedToTree !== true)) {
    cats
      .filter(c => c.addedToTree !== true)
      .forEach(c => {
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

const dataSource = (userId?: string) => {
  return {
    store: new CustomStore({
      load: function(loadOptions) {
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
          hostname: 'localhost',
          port: 9000,
          path: '/categories',
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
              const treeShape = buildTreeShape(data.payload.categories);
              console.log(JSON.stringify(treeShape, null, 4));
              resolve(treeShape);
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

      update: function(key: any | string | number, values: { caption: string }) {
        console.log(`updating with value ${JSON.stringify(values, null, 4)}`);
        const reqBody = {
          action: 'update',
          args: {
            categoryId: key,
            caption: values.caption,
          },
        };
        const bodyString = JSON.stringify(reqBody);

        const options = {
          method: 'POST',
          hostname: 'localhost',
          port: 9000,
          path: '/categories',
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
              const responseData = buffer.toString();
              console.info(`Response: ${JSON.stringify(responseData)}`);
              resolve(responseData);
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

      insert: function(cat: categoryTreeNode): Promise<any> | JQueryPromise<any> {
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
          hostname: 'localhost',
          port: 9000,
          path: '/categories',
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
              const responseData = buffer.toString();
              console.info(`Response: ${JSON.stringify(responseData)}`);
              resolve(responseData);
            });
          });

          req.on('error', err => {
            console.error(`Error inserting category: ${err.message || err}`);
            reject(err);
          });

          console.log(`Posting request: ${bodyString}`);
          req.write(bodyString);
          req.end();
        });
      },

      remove: function(key: any | string | number): Promise<any> | JQueryPromise<any> {
        console.log(`deleting elements: ${JSON.stringify(key)}`);
        const reqBody = {
          action: 'delete',
          args: {
            categoryId: key,
          },
        };
        const bodyString = JSON.stringify(reqBody);

        const options = {
          method: 'POST',
          hostname: 'localhost',
          port: 9000,
          path: '/categories',
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
              const responseData = buffer.toString();
              console.info(`Response: ${JSON.stringify(responseData)}`);
              resolve(responseData);
            });
          });

          req.on('error', err => {
            console.error(`Error deleting category: ${err.message || err}`);
            reject(err);
          });

          console.log(`Posting request: ${bodyString}`);
          req.write(bodyString);
          req.end();
        });
      },
      key: 'categoryId',
    }),
  };
};

export interface CategoryViewProps {
  userId?: string;
}

const expandedRowKeys = [1];

export class CategoryViewElement extends React.Component<CategoryViewProps> {
  constructor(props: CategoryViewProps) {
    super(props);
    this.onInitNewRow = this.onInitNewRow.bind(this);
  }

  customStore: CustomStore;

  render(): JSX.Element {
    const store = dataSource(this.props.userId);
    this.customStore = store.store;
    return (
      <div className="categoty-content">
        <b>Categories</b>
        <div className="sub-title">
          <div>Categories for user {this.props.userId}</div>
        </div>
        <TreeList
          id="categories"
          dataSource={store}
          defaultExpandedRowKeys={expandedRowKeys}
          showRowLines={true}
          showBorders={true}
          hoverStateEnabled={true}
          columnAutoWidth={true}
          itemsExpr="items"
          dataStructure="tree"
          keyExpr="categoryId"
          // rootValue=""
          parentIdExpr="parentCategoryId"
          onInitNewRow={this.onInitNewRow}
        >
          <Editing allowUpdating={true} allowDeleting={true} allowAdding={true} popup={popupOptions} mode="popup" />
          <Column dataField={'caption'} caption="Category Name">
            <ValidationRule type="required" />
          </Column>
          {/* <Column visible={false} dataField={'categoryId'} /> */}
          {/* <Column visible={false} dataField={'parentCategoryId'} /> */}
        </TreeList>
      </div>
    );
  }

  onInitNewRow(e: any) {
    if (e.data) {
      console.log(`onInitNewRow: ${JSON.stringify(e.data, null, 4)}`);
    }
  }
}

export default CategoryViewElement;
