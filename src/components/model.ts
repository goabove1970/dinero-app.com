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
  text: string;
  type: TreeMenuItemType;
  items?: TopMenuItem[];
  onClick: () => void;
}

export const categoriesMenuItem = {
  text: 'Categories',
  expanded: false,
  element: TreeMenuItemType.Categories,
  items: [],
};

const businessesMenuItem = {
  text: 'Businesses',
  expanded: false,
  element: TreeMenuItemType.Businesses,
  items: [],
};

const spendingsMenuItem = {
  text: 'Spendings',
  expanded: false,
  element: TreeMenuItemType.Spendings,
  items: [],
};

const accountsMenuItem = {
  // id: '2',
  text: 'Bank Accounts',
  expanded: false,
  element: TreeMenuItemType.Accounts,
  items: [],
};

const signOutMenuItem = {
  // id: '2',
  text: 'Sign Out',
  expanded: false,
  element: TreeMenuItemType.SignOut,
  items: [],
};

const myAccountMenuItem = {
  // id: '2',
  text: 'My Accounts',
  expanded: false,
  element: TreeMenuItemType.ManageAccount,
  items: [signOutMenuItem],
};

export const menuItemsSource: MainMenyItem[] = [
  spendingsMenuItem,
  {
    // id: '1',
    text: 'Transactions',
    expanded: false,
    element: TreeMenuItemType.Transactions,
  },
  categoriesMenuItem,
  accountsMenuItem,
  businessesMenuItem,
  myAccountMenuItem,
];

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
