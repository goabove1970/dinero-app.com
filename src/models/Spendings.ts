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
