export interface MonthlyCategorySpending {
  parentCategoryId?: string;
  categoryId?: string;
  categoryName?: string;
  month?: Date;
  monthName?: string;
  debit?: number;
  credit?: number;
}

export interface SpendingsMonthlyResponse {
  parents: MonthlyCategorySpending[];
  subs: MonthlyCategorySpending[];
}

export interface MonthlyBalance {
  debit: number;
  credit: number;
  month: Date;
}

export interface SpendingServiceResponse {
  parentCategories?: any[];
  subCatgories?: any[];
  spendingProgression?: any[];
  spendingsByMonth?: SpendingsMonthlyResponse;
  annualBalances?: MonthlyBalance[];
}
