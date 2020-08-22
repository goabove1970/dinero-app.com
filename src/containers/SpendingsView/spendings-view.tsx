import * as React from 'react';

import 'devextreme/data/odata/store';
import 'whatwg-fetch';
import './spendings-view.css';
import {
  TransactionIntervalType,
  TransactionIntervalSelectionOption,
  buildTransactionIntervalOption,
  renderIntervalButtonsRow,
} from '../common/intervals';
import { TransactionCategorizationType } from '../common/categorization';
import { buildCategoriesDataSource } from '../../dataSources/categoriesDataSource';
import CustomStore from 'devextreme/data/custom_store';

import { category, categoryTreeNode } from '../../contracts/categoryTreeNode';
import PieChart, { Label, Font, Connector } from 'devextreme-react/pie-chart';
import DataGrid, { Paging, Pager, Column, Lookup, Format } from 'devextreme-react/data-grid';
import { buildTransactionDataSource } from '../TransactionView/transactionDataSource';
import {
  Chart,
  Series,
  ArgumentAxis,
  CommonSeriesSettings,
  Legend,
  Margin,
  Tooltip,
  Grid,
  CommonAxisSettings,
} from 'devextreme-react/chart';
import { LoadIndicator } from 'devextreme-react';
import moment = require('moment');
import { renderMonthsIntervalButtonsRow } from '../common/months';
import { SpendingsMonthlyResponse, SpendingServiceResponse } from '../../models/Spendings';
import MonthlyCategoriesElement from '../MontlyCategories';
import { inspect } from 'util';
import { buildSpendingsDataSource } from '../../dataSources/spendingsDataSource';

export interface SpendingsViewProps {
  accountId?: string;
  userId?: string;
}

export interface SpendingsData {
  debitCategories: any[];
  creditCategories: any[];
}

export interface SpendingsViewState {
  selectedIntervalType?: TransactionIntervalType;
  transactionsForMonth?: Date;
  selectedCategorizationType: TransactionCategorizationType;
  selectedTransaction?: any;
  selectedCategoryId?: string;
  selectedCategoryName?: string;
  categoriesItems?: categoryTreeNode[];
  debitCategories: any[];
  creditCategories: any[];
  categoriesItemsLoaded?: boolean;
  spendingsLoaded?: boolean;
  startDate?: Date;
  endDate?: Date;
  spendings: SpendingServiceResponse;
}

const categoryReadTransformation = (loadedCategories: category[]): categoryTreeNode[] => {
  return loadedCategories.map((c: category) => {
    return {
      caption: c.caption,
      categoryId: c.categoryId,
      key: c.categoryId,
      items: [],
    };
  });
};

export class SpendingsViewElement extends React.Component<SpendingsViewProps, SpendingsViewState> {
  selectedRowData: any;
  spendingsLines = [
    { value: 'credit', name: 'Credit', color: 'blue' },
    { value: 'debit', name: 'Debit', color: 'yellow' },
    { value: 'cumulateDebit', name: 'Spendings', color: 'red' },
    { value: 'cumulateCredit', name: 'Income', color: 'green' },
  ];

  constructor(props: SpendingsViewProps) {
    super(props);

    this.state = {
      selectedIntervalType: TransactionIntervalType.thisMonth,
      selectedCategorizationType: 'all',
      spendings: {
        parentCategories: [],
        subCatgories: [],
        spendingProgression: [],
      },
      debitCategories: [],
      creditCategories: [],
    };

    this.onTransactionIntervalChanged = this.onTransactionIntervalChanged.bind(this);
    this.onPiePointClick = this.onPiePointClick.bind(this);
    this.onMonthIntervalChanged = this.onMonthIntervalChanged.bind(this);
    this.clearCategoryId = this.clearCategoryId.bind(this);
    this.categoryChanged = this.categoryChanged.bind(this);
    this.refreshStartEndDate = this.refreshStartEndDate.bind(this);
    this.refreshSpendings = this.refreshSpendings.bind(this);
  }

  onTransactionIntervalChanged(e: any) {
    // console.log('onTransactionIntervalChanged attrs');
    // console.log(inspect(args1));
    // console.log(inspect(e));
    // console.log(inspect(e.target.dataset.elementattr));
    const selectedIntervalData = JSON.parse(e.target.dataset.elementattr) as TransactionIntervalSelectionOption;
    // notify(`Requesting transactions for ${selectedIntervalData.caption}`);
    const newStartMonth = undefined;
    const newSelectedIntervalType = selectedIntervalData.intervalType;
    this.setState({
      ...this.state,
      transactionsForMonth: newStartMonth,
      selectedIntervalType: newSelectedIntervalType,
      spendingsLoaded: false,
    });

    const dates = this.refreshStartEndDate(newSelectedIntervalType, newStartMonth);
    this.refreshSpendings(dates.startDate, dates.endDate);
  }

  onMonthIntervalChanged(e: any) {
    const selectedIntervalData = JSON.parse(e.target.dataset.elementattr) as TransactionIntervalSelectionOption;
    const newStartMonth = selectedIntervalData.startDate;
    const newSelectedIntervalType = undefined;

    this.setState({
      ...this.state,
      transactionsForMonth: newStartMonth,
      selectedIntervalType: newSelectedIntervalType,
      spendingsLoaded: false,
    });

    const dates = this.refreshStartEndDate(newSelectedIntervalType, newStartMonth);
    this.refreshSpendings(dates.startDate, dates.endDate);
  }

  categoryChanged(selectedCategoryId: string | undefined, spendings: SpendingServiceResponse): SpendingsData {
    const data: SpendingsData = {
      debitCategories: [],
      creditCategories: [],
    };
    if (selectedCategoryId) {
      let subs = (spendings.subCatgories || []).filter((c: any) => c.parentCategoryId === selectedCategoryId);
      // console.log(`subs: ${inspect(subs)}`);
      const parent = (spendings.parentCategories || []).filter((c: any) => c.categoryId === selectedCategoryId)[0];
      if (parent) {
        // console.log(`Parents: ${inspect(parent)}`);
        const totalSubCredit = subs.reduce(
          (accumulator: number, currentValue: any) => accumulator + currentValue.credit,
          0
        );
        const totalSubDebit = subs.reduce(
          (accumulator: number, currentValue: any) => accumulator + currentValue.debit,
          0
        );
        const totalRestCredit = parent.credit - totalSubCredit;
        const totalRestDebit = parent.debit - totalSubDebit;
        const rest = {
          name: parent.name,
          categoryId: parent.categoryId,
          parentCategoryId: parent.categoryId,
          debit: totalRestDebit,
          credit: totalRestCredit,
          saldo: totalRestCredit - totalRestDebit,
        };
        subs = subs.concat(rest);
      }

      data.debitCategories = subs
        .filter((cs: any) => cs.debit > 0)
        .sort((a: any, b: any) => {
          return a.debit - b.debit;
        });
      data.creditCategories = subs
        .filter((cs: any) => cs.credit > 0)
        .sort((a: any, b: any) => {
          return a.credit - b.credit;
        });
    } else {
      data.debitCategories = (spendings.parentCategories || [])
        .filter((cs: any) => cs.debit > 0)
        .sort((a: any, b: any) => {
          return a.debit - b.debit;
        });
      data.creditCategories = (spendings.parentCategories || [])
        .filter((cs: any) => cs.credit > 0)
        .sort((a: any, b: any) => {
          return a.credit - b.credit;
        });
    }
    return data;
  }

  onPiePointClick(e: any) {
    if (this.state.selectedCategoryId) {
      this.clearCategoryId();
    } else {
      const target = e.target;
      // console.log(inspect(target.data));
      const data = this.categoryChanged(target.data.categoryId, this.state.spendings);
      this.setState({
        ...this.state,
        debitCategories: data.debitCategories,
        creditCategories: data.creditCategories,
        selectedCategoryId: target.data.categoryId,
        selectedCategoryName: target.data.name,
      });
    }
  }

  clearCategoryId() {
    const data = this.categoryChanged(undefined, this.state.spendings);
    this.setState({
      ...this.state,
      debitCategories: data.debitCategories,
      creditCategories: data.creditCategories,
      selectedCategoryId: undefined,
      selectedCategoryName: undefined,
    });
  }

  refreshStartEndDate(
    selectedIntervalType?: TransactionIntervalType | undefined,
    transactionsForMonth?: Date | undefined
  ): {
    startDate?: Date;
    endDate?: Date;
  } {
    let startDate: Date | undefined = moment().startOf('month').toDate();
    let endDate: Date | undefined = moment().startOf('month').add(1, 'month').subtract(1, 'day').toDate();

    if (selectedIntervalType) {
      const intervalOption = buildTransactionIntervalOption(selectedIntervalType);
      startDate = intervalOption!.startDate;
      endDate = intervalOption!.endDate;
    } else if (transactionsForMonth) {
      startDate = moment(transactionsForMonth).startOf('month').toDate();
      endDate = moment(startDate).startOf('month').add(1, 'month').subtract(1, 'day').toDate();
    }

    this.setState({
      ...this.state,
      startDate,
      endDate,
    });

    return {
      startDate,
      endDate,
    };
  }

  refreshSpendings(startDate?: Date, endDate?: Date) {
    const source = buildSpendingsDataSource({
      startDate: startDate,
      endDate: endDate,
      userId: this.props.userId,
    });

    source.store.load().then((res: SpendingServiceResponse) => {
      const data = this.categoryChanged(this.state.selectedCategoryId, res);
      // console.log(`SpendingServiceResponse: ${inspect(res)}`);
      this.setState({
        ...this.state,
        spendings: res,
        debitCategories: data.debitCategories,
        creditCategories: data.creditCategories,
        spendingsLoaded: true,
      });
    });
  }

  componentDidMount() {
    const dates = this.refreshStartEndDate(this.state.selectedIntervalType, this.state.transactionsForMonth);

    //////        LOADING CATEGORIES        //////

    const categoriesStore = buildCategoriesDataSource(this.props.userId);
    categoriesStore.store.load().then((res) =>
      this.setState({
        ...this.state,
        categoriesItems: categoryReadTransformation(res),
        categoriesItemsLoaded: true,
      })
    );

    //////        LOADING SPENDINGS        //////
    this.refreshSpendings(dates.startDate, dates.endDate);
  }

  render(): JSX.Element {
    // console.log(`this.state.spendings: ${inspect(this.state.spendings && this.state.spendings.annualBalances)}`);
    // console.log(`transactions: ${inspect(this.state.transactions)}`);
    // console.log(`debitCategories: ${inspect(this.state.debitCategories)}`);
    // console.log(`this.state.spendings.spendingsByMonth: ${inspect(this.state.spendings.spendingsByMonth)}`);

    return (
      <div className="spendings-content">
        <div className="transactions-span">
          {/* <div className="caption">Select Period</div> */}
          {renderIntervalButtonsRow(this.state.selectedIntervalType, this.onTransactionIntervalChanged)}
          {renderMonthsIntervalButtonsRow(this.state.transactionsForMonth, this.onMonthIntervalChanged)}
        </div>

        <div className="pie-row">
          {this.state.debitCategories && this.state.debitCategories.length > 0 && (
            <div className="pie">
              <div className="caption">
                {this.state.selectedCategoryName ? `${this.state.selectedCategoryName} Spedings` : `Spendings`}
              </div>
              {!this.state.spendingsLoaded ? (
                <LoadIndicator id="large-indicator" height={80} width={80}></LoadIndicator>
              ) : (
                  <PieChart
                    id="pieChart"
                    palette="Bright"
                    dataSource={this.state.debitCategories}
                    // title={this.state.selectedCategoryName ? `${this.state.selectedCategoryName} Spedings` : `Spendings`}
                    onPointClick={this.onPiePointClick}
                  >
                    <Legend
                      verticalAlignment="bottom"
                      horizontalAlignment="center"
                      itemTextPosition="right"
                      // rowCount={5}
                      columnCount={5}
                    />
                    <Series argumentField="name" valueField="debit">
                      <Label visible={true} position="columns" customizeText={customizeText}>
                        <Font size={11} />
                        <Connector visible={true} width={0.2} />
                      </Label>
                    </Series>
                  </PieChart>


                )}
            </div>
          )}
          <div className="pie-break"></div>
          {this.state.creditCategories && this.state.creditCategories.length > 0 && (
            <div className="pie">
              <div className="caption">
                {this.state.selectedCategoryName ? `${this.state.selectedCategoryName} Income` : `Income`}
              </div>
              {!this.state.spendingsLoaded ? (
                <LoadIndicator id="large-indicator" height={80} width={80}></LoadIndicator>
              ) : (
                  <PieChart
                    id="pieChart"
                    palette="Bright"
                    dataSource={this.state.creditCategories}
                    // title={this.state.selectedCategoryName ? `${this.state.selectedCategoryName} Income` : `Income`}
                    onPointClick={this.onPiePointClick}
                  >
                    <Legend
                      orientation="horizontal"
                      itemTextPosition="right"
                      horizontalAlignment="center"
                      verticalAlignment="bottom"
                      columnCount={5}
                    />
                    <Series argumentField="name" valueField="credit">
                      <Label visible={true} position="columns" customizeText={customizeText}>
                        <Font size={11} />
                        <Connector visible={true} width={0.2} />
                      </Label>
                    </Series>
                  </PieChart>
                )}
            </div>
          )}
        </div>

        {this.state.spendings && this.state.spendings.spendingsByMonth && (
          <div className="monthly-spendings">
            <div className="caption">Top Spendings Categories</div>
            <MonthlyCategoriesElement
              spendings={this.state.spendings.spendingsByMonth}
              categoryId={this.state.selectedCategoryId}
              topCategoriedLimit={7}
            />
          </div>
        )}



        {
          <div className="income-spendings">
            <div className="caption">Income vs Spendings</div>
            <div>
              {!this.state.spendingsLoaded ? (
                <LoadIndicator id="large-indicator" height={80} width={80}></LoadIndicator>
              ) : (
                  <Chart
                    palette="Bright"
                    dataSource={this.state.spendings.spendingProgression}
                  // title="Income / Spendings"
                  >
                    <CommonSeriesSettings argumentField="date" type={'spline'} />
                    <CommonAxisSettings>
                      <Grid visible={true} />
                    </CommonAxisSettings>
                    {this.spendingsLines.map(function (item) {
                      return (
                        <Series
                          key={item.value}
                          valueField={item.value}
                          name={item.name}
                          color={item.color}
                          point={{ size: 0 }}
                        />
                      );
                    })}
                    {/* <Margin bottom={20} /> */}
                    <ArgumentAxis allowDecimals={false} axisDivisionFactor={60}></ArgumentAxis>
                    <Legend verticalAlignment="top" horizontalAlignment="right" />
                    <Tooltip enabled={true} />
                  </Chart>
                )}
            </div>
          </div>
        }
      </div>
    );
  }
}

function customizeText(arg: any) {
  // console.log(`customizeText, arg: ${inspect(arg)}`);
  return `${arg.argumentText}, $${Math.floor(arg.valueText)} (${arg.percentText})`;
  // return `${Math.floor(arg.valueText)} (${arg.percentText})`;
}

export class TransactionContextMenuSource {
  store: CustomStore;
}

export default SpendingsViewElement;
