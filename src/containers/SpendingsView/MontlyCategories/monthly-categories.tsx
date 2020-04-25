import * as React from 'react';

import 'devextreme/data/odata/store';
import 'whatwg-fetch';
import './monthly-categories.css';
import { SpendingsMonthlyResponse, MonthlyCategorySpending } from '../../../models/Spendings';
import moment = require('moment');
import { inspect } from 'util';
import { DataGrid, Chart } from 'devextreme-react';
import { Column } from 'devextreme-react/data-grid';
import { Tooltip, CommonSeriesSettings, SeriesTemplate, Label, Format } from 'devextreme-react/chart';

interface MonthlyCategoriesProps {
  spendings: SpendingsMonthlyResponse;
  categoryId?: string;
  topCategoriedLimit?: number;
}

interface MonthlyCategoriesState {
  store: MonthlyCategorySpending[];
  storeLoaded?: boolean;
}

export class MonthlyCategoriesElement extends React.Component<MonthlyCategoriesProps, MonthlyCategoriesState> {
  constructor(props: MonthlyCategoriesProps) {
    super(props);
    console.log(`MonthlyCategoriesElement, props: ${inspect(props)}`);

    this.state = {
      store: this.buildSpendingsStore(props),
    };
  }

  buildSpendingsStore(props: MonthlyCategoriesProps) {
    const source = props.categoryId
      ? props.spendings.subs.filter((c) => c.parentCategoryId === props.categoryId)
      : props.spendings.parents;
    console.log(`Source: ${inspect(source)}`);
    const lastMonth = source.reduce((lastMonth, c) => {
      if (moment(c.month).isAfter(lastMonth)) {
        return moment(c.month);
      }
      return lastMonth;
    }, moment().subtract(1000, 'year'));
    let lastMonthTransactions = source.filter((m) => {
      return moment(m.month).startOf('month').isSame(moment(lastMonth).startOf('month'));
    });
    lastMonthTransactions
      .sort((a, b) => {
        return (a.debit || 0) - (b.debit || 0);
      })
      .reverse();
    let keep = Math.min(lastMonthTransactions.length, props.topCategoriedLimit || 10);
    const topCategories = new Set<string>();
    lastMonthTransactions = lastMonthTransactions.slice(0, keep);
    lastMonthTransactions

      .map((c) => c.categoryId)
      .filter((c) => c !== undefined)
      .forEach((c: string) => topCategories.add(c));
    // console.log(`topCategories: ${inspect(topCategories)}`);

    const topCategoriesSource = source.filter((c) => c.categoryId && topCategories.has(c.categoryId));
    topCategoriesSource
      .sort((a, b) => {
        return (a.debit || 0) - (b.debit || 0);
      })
      .reverse();
    return topCategoriesSource;
  }

  componentWillReceiveProps(props: MonthlyCategoriesProps) {
    this.setState({
      ...this.state,
      store: this.buildSpendingsStore(props),
    });
  }

  componentDidMount() {}
  customizeTooltip(arg: any) {
    // console.log(`customizeTooltip: ${inspect(arg)}`);
    return {
      text: `${arg.argument}  $${Math.floor(arg.valueText)}`,
    };
  }

  render(): JSX.Element {
    return (
      <div className="monthly-content">
        <div className="categories-table">
          <DataGrid
            id={'stats-table'}
            dataSource={this.state.store}
            showBorders={false}
            showColumnHeaders={false}
            showColumnLines={false}
          >
            <Column dataField={'categoryName'} caption="Description" width={200} defaultSortOrder="asc" sortIndex={1} />
            <Column
              dataField={'debit'}
              caption="Total Amount"
              width={80}
              sortIndex={0}
              format={'###,###.'}
              defaultSortOrder="desc"
              sortOrder="desc"
            />
          </DataGrid>
        </div>

        <div className="categories-chart">
          <Chart id="chart" palette="Bright" dataSource={this.state.store}>
            <SeriesTemplate nameField="categoryName" />
            <CommonSeriesSettings argumentField="categoryName" valueField="debit" type="bar" ignoreEmptyPoints={true}>
              <Label visible={true}>
                <Format type="fixedPoint" precision={0} />
              </Label>
            </CommonSeriesSettings>
            <Tooltip enabled={true} location="edge" customizeTooltip={this.customizeTooltip} />
          </Chart>
        </div>
      </div>
    );
  }
}

export default MonthlyCategoriesElement;
