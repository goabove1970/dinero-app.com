import CustomStore from 'devextreme/data/custom_store';
import * as http from 'http';
import { buildTreeShape } from '../../dataSources/categoriesDataSource';
import { categoryTreeNode } from '../../contracts/categoryTreeNode';
import CONFIG from '../../config';

export type TransactionContextMenuItemType =
  | 'moveToCategory'
  | 'unhide'
  | 'hide'
  | 'include'
  | 'exclude'
  | 'removeFromCalculations'
  | 'empty';

export interface ContextMenuItem {
  text: string;
  items?: ContextMenuItem[];
  id?: string;
  itemType: TransactionContextMenuItemType;
  icon?: string;
  beginGroup?: boolean;
}

const categoryTreeShapeToDoubleLevelMenu = (tree: categoryTreeNode[]): ContextMenuItem[] => {
  const upperLevel: ContextMenuItem[] = [];
  tree.forEach((e: categoryTreeNode) => {
    const contextMenuItem: ContextMenuItem = {
      text: e.caption,
      id: e.categoryId,
      items: [],
      itemType: 'moveToCategory',
    };
    upperLevel.push(contextMenuItem);
    if (e.items && e.items.length) {
      e.items.forEach((se: categoryTreeNode) => {
        const contextMenuSubItem: ContextMenuItem = {
          text: se.caption,
          id: se.categoryId,
          itemType: 'moveToCategory',
        };
        contextMenuItem.items!.push(contextMenuSubItem);
      });
    }
  });
  const sortedUpperLevel = upperLevel.sort((a, b) => (a.text > b.text ? 1 : -1));
  sortedUpperLevel.forEach((e: ContextMenuItem) => {
    e.items = e.items && e.items.sort((a, b) => (a.text > b.text ? 1 : -1));
  });
  return sortedUpperLevel;
};

export const buildTransactionContextMenuDataSource = (userId?: string) => {
  return {
    store: new CustomStore({
      key: 'categoryId',

      load: function (loadOptions: any): Promise<ContextMenuItem[]> {
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

        //console.log(`request options: ${JSON.stringify(options, null, 4)}`);

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
              //console.info(`Response: ${buffer}`);
              const data = JSON.parse(buffer.toString());
              const treeShape = buildTreeShape(data.payload.categories);
              // console.log(`treeShape of categpries: ${JSON.stringify(treeShape, null, 4)}`);
              const menu = categoryTreeShapeToDoubleLevelMenu(treeShape);
              // console.log(`Build double level menu of categpries: ${JSON.stringify(menu, null, 4)}`);
              resolve(menu);
            });
          });

          req.on('error', (err) => {
            console.error(`Error: ${err.message || err}`);
            reject(err);
          });

          // console.log(`Posting category request for context menu: ${bodyString}`);
          req.write(bodyString);
          req.end();
        });
      },
    }),
  };
};
