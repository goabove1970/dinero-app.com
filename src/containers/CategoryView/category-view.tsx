import * as React from 'react';

import 'devextreme/data/odata/store';
import { TreeList, Column, Editing, ValidationRule, Lookup } from 'devextreme-react/tree-list';
import CustomStore from 'devextreme/data/custom_store';

// import DataGrid, { Column, Paging, Pager } from 'devextreme-react/data-grid';
// import CustomStore from 'devextreme/data/custom_store';
import 'whatwg-fetch';
import './category-view.css';
import { buildCategoriesDataSource } from '../../dataSources/categoriesDataSource';

const popupOptions = {
  title: 'Employee Info',
  showTitle: true,
  width: 700,
  position: { my: 'top', at: 'top', of: window },
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
    const store = buildCategoriesDataSource(this.props.userId);
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
