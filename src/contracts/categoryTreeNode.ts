export interface categoryTreeNode {
  caption: string;
  categoryId: string;
  parentCategoryId?: string;
  key: string;
  items: categoryTreeNode[];
}

export interface category {
  caption: string;
  categoryId: string;
  parentCategoryId: string;
  addedToTree?: boolean;
}
