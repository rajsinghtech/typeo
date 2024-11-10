export interface Category {
  practiceStrings: string[];
  name?: string;
  color?: string;
}

export const emptyCategory: Category = { practiceStrings: [] };
