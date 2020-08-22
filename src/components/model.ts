export enum TreeMenuItemType {
  Transactions,
  BankConnections,
  Accounts,
  Categories,
  SubCategories,
  Businesses,
  Spendings,
  ManageAccount,
  SignOut,
  ImportTransactions,
  AnnualTrends,
}

export interface MainMenyItem {
  text: string;
  expanded: boolean;
  element: TreeMenuItemType;
  items?: MainMenyItem[];
}

export interface TopMenuItem {
  text?: string;
  type: TreeMenuItemType;
  items?: TopMenuItem[];
  icon?: any;
  onClick: () => void;
}

export interface category {
  caption: string;
  categoryId: string;
  parentCategoryId: string;
  addedToTree?: boolean;
}

export function topLevelCategoriesNodes(
  cats: category[]
): {
  text: string;
  expanded: boolean;
  element: TreeMenuItemType;
  items?: any[];
}[] {
  return cats
    .filter((c) => c.parentCategoryId === undefined)
    .map((c) => {
      return {
        text: c.caption,
        expanded: false,
        element: TreeMenuItemType.SubCategories,
      };
    });
}
