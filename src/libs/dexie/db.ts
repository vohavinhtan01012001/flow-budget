import Dexie, { type EntityTable } from 'dexie';

import { ESyncOperation, ESyncStatus } from '@/models/enums/expense.enum';

export interface ILocalBudget {
  amount: number;
  categoryId: null | string;
  localId: number;
  period: 'daily' | 'monthly' | 'weekly';
  serverId: null | string;
  syncStatus: ESyncStatus;
  userId: string;
}

export interface ILocalCategory {
  color: null | string;
  icon: null | string;
  isPreset: boolean;
  localId: number;
  name: string;
  serverId: null | string;
  sortOrder: number;
  syncStatus: ESyncStatus;
  userId: null | string;
}

export interface ILocalExpense {
  amount: number;
  categoryId: null | string;
  createdAt: string;
  description: null | string;
  expenseDate: string;
  localId: number;
  note: null | string;
  serverId: null | string;
  syncStatus: ESyncStatus;
  updatedAt: string;
  userId: string;
}

export interface ILocalKeywordMapping {
  categoryId: string;
  keyword: string;
  localId: number;
  serverId: null | string;
  syncStatus: ESyncStatus;
  userId: string;
}

export interface ISyncQueueItem {
  createdAt: string;
  id: number;
  operation: ESyncOperation;
  payload: string;
  retryCount: number;
  serverId: null | string;
  table: string;
}

class FlowBudgetDB extends Dexie {
  budgets!: EntityTable<ILocalBudget, 'localId'>;
  categories!: EntityTable<ILocalCategory, 'localId'>;
  expenses!: EntityTable<ILocalExpense, 'localId'>;
  keywordMappings!: EntityTable<ILocalKeywordMapping, 'localId'>;
  syncQueue!: EntityTable<ISyncQueueItem, 'id'>;

  constructor() {
    super('FlowBudgetDB');

    this.version(1).stores({
      budgets:
        '++localId, serverId, userId, categoryId, period, syncStatus',
      categories:
        '++localId, serverId, userId, name, isPreset, syncStatus',
      expenses:
        '++localId, serverId, userId, categoryId, expenseDate, syncStatus, createdAt',
      keywordMappings:
        '++localId, serverId, userId, keyword, categoryId, syncStatus',
      syncQueue: '++id, table, operation, createdAt',
    });
  }
}

export const db = new FlowBudgetDB();
