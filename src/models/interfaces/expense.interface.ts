import type { EBudgetPeriod, ESyncStatus } from '../enums/expense.enum';

export interface IBudget {
  amount: number;
  categoryId: null | string;
  createdAt: string;
  id: string;
  period: EBudgetPeriod;
  updatedAt: string;
  userId: string;
}

export interface ICategory {
  color: null | string;
  icon: null | string;
  id: string;
  isPreset: boolean;
  name: string;
  sortOrder: number;
  userId: null | string;
}

export interface IExpense {
  amount: number;
  categoryId: null | string;
  createdAt: string;
  description: null | string;
  expenseDate: string;
  id: string;
  note: null | string;
  updatedAt: string;
  userId: string;
}

export interface IKeywordMapping {
  categoryId: string;
  id: string;
  keyword: string;
  userId: string;
}

export interface ILocalBudget extends Omit<IBudget, 'id'> {
  localId: number;
  serverId: null | string;
  syncStatus: ESyncStatus;
}

export interface ILocalCategory extends Omit<ICategory, 'id'> {
  localId: number;
  serverId: null | string;
  syncStatus: ESyncStatus;
}

export interface ILocalExpense extends Omit<IExpense, 'id'> {
  localId: number;
  serverId: null | string;
  syncStatus: ESyncStatus;
}

export interface ILocalKeywordMapping extends Omit<IKeywordMapping, 'id'> {
  localId: number;
  serverId: null | string;
  syncStatus: ESyncStatus;
}
