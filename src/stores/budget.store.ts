import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { db, ILocalBudget } from '@/libs/dexie/db';
import { addToSyncQueue } from '@/libs/dexie/sync';
import { EBudgetPeriod, ESyncOperation, ESyncStatus } from '@/models/enums/expense.enum';

interface IState {
  addBudget: (
    userId: string,
    categoryId: null | string,
    amount: number,
    period: EBudgetPeriod,
  ) => Promise<void>;
  budgets: ILocalBudget[];
  deleteBudget: (localId: number) => Promise<void>;
  loadBudgets: (userId: string) => Promise<void>;
  updateBudget: (
    localId: number,
    data: Partial<ILocalBudget>,
  ) => Promise<void>;
}

export const useBudgetStore = create<IState>()(
  devtools((set, get) => ({
    addBudget: async (userId, categoryId, amount, period) => {
      await db.budgets.add({
        amount,
        categoryId,
        period,
        serverId: null,
        syncStatus: ESyncStatus.Pending,
        userId,
      } as ILocalBudget);

      await addToSyncQueue('budgets', ESyncOperation.Create, {
        amount,
        category_id: categoryId,
        period,
        user_id: userId,
      });

      await get().loadBudgets(userId);
    },

    budgets: [],

    deleteBudget: async (localId) => {
      const budget = await db.budgets.get(localId);
      if (!budget) return;

      await db.budgets.delete(localId);

      if (budget.serverId) {
        await addToSyncQueue(
          'budgets',
          ESyncOperation.Delete,
          {},
          budget.serverId,
        );
      }

      set({
        budgets: get().budgets.filter((b) => b.localId !== localId),
      });
    },

    loadBudgets: async (userId) => {
      const budgets = await db.budgets
        .where('userId')
        .equals(userId)
        .toArray();
      set({ budgets });
    },

    updateBudget: async (localId, data) => {
      await db.budgets.update(localId, {
        ...data,
        syncStatus: ESyncStatus.Pending,
      });

      const budget = await db.budgets.get(localId);
      if (budget?.serverId) {
        await addToSyncQueue(
          'budgets',
          ESyncOperation.Update,
          { amount: data.amount, category_id: data.categoryId, period: data.period },
          budget.serverId,
        );
      }

      await get().loadBudgets(budget?.userId ?? '');
    },
  })),
);
