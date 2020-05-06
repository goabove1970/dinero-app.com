import * as React from 'react';

import 'devextreme/data/odata/store';
import { TreeList, Column, Editing, ValidationRule, Lookup } from 'devextreme-react/tree-list';
import CustomStore from 'devextreme/data/custom_store';

import 'whatwg-fetch';
import './category-view.css';
import { buildCategoriesDataSource } from '../../dataSources/categoriesDataSource';
import { LoadIndicator } from 'devextreme-react';
import { inspect } from 'util';
import { categoryTreeNode } from '../../contracts/categoryTreeNode';
import DevExpress from 'devextreme/bundles/dx.all';

const popupOptions = {
  title: 'Add New Category',
  showTitle: true,
  width: 700,
  height: 300,
  position: { my: 'center', at: 'center', of: window },
};

export interface CategoryViewProps {
  userId?: string;
}

export interface CategoryViewState {
  storeLoaded?: boolean;
  failedToLoad?: boolean;
  categories?: categoryTreeNode[];
}

const expandedRowKeys = [1];

export class CategoryViewElement extends React.Component<CategoryViewProps, CategoryViewState> {
  constructor(props: CategoryViewProps) {
    super(props);

    this.state = {
      storeLoaded: false,
      failedToLoad: false,
    };
    this.onRowInserting = this.onRowInserting.bind(this);
    this.onRowRemoving = this.onRowRemoving.bind(this);
    this.onRowUpdated = this.onRowUpdated.bind(this);
  }

  // customStore: CustomStore;

  reloadCategories() {
    // console.log(`loading categories for user ${this.props.userId}`);
    const store = buildCategoriesDataSource(this.props.userId);
    store.store
      .load()
      .then((cats: categoryTreeNode[]) => {
        cats = cats.sort((a, b) => (a.caption < b.caption ? -1 : 1));
        cats.forEach((c) => (c.items = c.items.sort((a, b) => (a.caption < b.caption ? -1 : 1))));
        // console.log(`Loaded cats: ${inspect(cats)}`);
        this.setState({
          ...this.state,
          storeLoaded: true,
          categories: cats,
        });
      })
      .catch((err) => {
        console.log(err.message || err);
        this.setState({
          ...this.state,
          failedToLoad: true,
        });
      });
  }

  componentDidMount() {
    this.reloadCategories();
  }

  render(): JSX.Element {
    // console.log(`Categories source: ${inspect(this.state.categories)}`);
    // const store = buildCategoriesDataSource(this.props.userId);
    // this.customStore = store.store;
    return (
      <div className="categoty-content">
        <div className="caption">Categories</div>
        {!this.state.storeLoaded ? (
          <LoadIndicator id="large-indicator" height={80} width={80}></LoadIndicator>
        ) : (
          <TreeList
            id="categories"
            dataSource={this.state.categories}
            defaultExpandedRowKeys={expandedRowKeys}
            showRowLines={true}
            showBorders={true}
            hoverStateEnabled={true}
            columnAutoWidth={true}
            itemsExpr="items"
            dataStructure="tree"
            keyExpr="categoryId"
            rootValue=""
            parentIdExpr="parentCategoryId"
            onRowInserting={this.onRowInserting}
            onRowRemoving={this.onRowRemoving}
            onRowUpdated={this.onRowUpdated}
            key={'categoryId'}
          >
            <Editing allowUpdating={true} allowDeleting={true} allowAdding={true} popup={popupOptions} mode="popup" />
            <Column dataField={'caption'} caption="Category Name">
              <ValidationRule type="required" />
            </Column>
            <Column dataField={'categoryId'} caption="Category Id" visible={false} allowEditing={false}></Column>
          </TreeList>
        )}
      </div>
    );
  }

  onRowInserting(e: {
    component?: DevExpress.ui.GridBase;
    element?: DevExpress.core.dxElement;
    model?: any;
    data?: any;
    cancel?: boolean | Promise<void> | JQueryPromise<void>;
  }) {
    // console.log(`onRowInserting: ${inspect(e)}`);
    const data = e.data as categoryTreeNode;
    console.log(`inserting: ${inspect(data)}`);

    if (data.parentCategoryId && this.state.categories) {
      const parents = this.state.categories.filter((c: categoryTreeNode) => {
        return c.categoryId === data.parentCategoryId;
      });
      if (parents.length === 0) {
        console.error(`Can not add subcategory to subcategory, cancelling`);
        // e.cancel = true;
        this.reloadCategories();
        return;
      }
    }

    if (data) {
      const store = buildCategoriesDataSource(this.props.userId);
      store.store.insert(data).then(() => {
        this.reloadCategories();
      });
    }
  }
  onRowRemoving(e: {
    component?: DevExpress.ui.GridBase;
    element?: DevExpress.core.dxElement;
    model?: any;
    data?: any;
    cancel?: boolean | Promise<void> | JQueryPromise<void>;
  }) {
    // console.log(`Removing: ${inspect(e)}`);
    if (e.data) {
      const store = buildCategoriesDataSource(this.props.userId);
      store.store.remove((e.data as categoryTreeNode).categoryId).then(() => {
        // console.log('refreshing categories grid');
        this.reloadCategories();
      });
    }
  }
  onRowUpdated(e: {
    component?: DevExpress.ui.GridBase;
    element?: DevExpress.core.dxElement;
    model?: any;
    data?: any;
    key?: any;
    error?: Error;
  }) {
    const data = e.data as categoryTreeNode;
    const key = e.key as string;

    if (data) {
      const store = buildCategoriesDataSource(this.props.userId);
      store.store.update(key, data).then(() => {
        this.reloadCategories();
      });
    }
  }
}

export default CategoryViewElement;
