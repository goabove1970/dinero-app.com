import * as React from 'react';

import 'devextreme/data/odata/store';
import DataGrid, { Column, Paging, Pager } from 'devextreme-react/data-grid';
import 'whatwg-fetch';
import './business-view.css';
import { buildBusinessDataSource, BusinessRequestArgs } from './businessDataSource';

export interface BusinessViewProps {
  accountId?: string;
}

export interface BusinessViewState {}

export class BusinessViewElement extends React.Component<BusinessViewProps, BusinessViewState> {
  constructor(props: BusinessViewProps) {
    super(props);
    console.log(`constructing DataGridElement for business for account '${props.accountId}'`);
    this.state = {};
  }

  render(): JSX.Element {
    console.log('rendering DataGridElement');
    return (
      <div className="business-content">
        <div>
          <b>Business</b>
          <div className="sub-title">
            <div>Business for account {this.props.accountId}</div>
          </div>
        </div>
        <DataGrid
          dataSource={buildBusinessDataSource({
            accountId: this.props.accountId,
          } as BusinessRequestArgs)}
          columnAutoWidth={true}
          showBorders={true}
          showRowLines={true}
          selection={{ mode: 'single' }}
          hoverStateEnabled={true}
        >
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} allowedPageSizes={[5, 10, 20, 100]} showInfo={true} />
          <Column dataField={'name'} caption="Business Name" />
        </DataGrid>
      </div>
    );
  }
}

export default BusinessViewElement;
