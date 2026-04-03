import dayjs from 'dayjs';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { TExpenseFilter } from '@/models/types/expense.type';

import { db, ILocalExpense } from '@/libs/dexie/db';
import { addToSyncQueue, processSyncQueue } from '@/libs/dexie/sync';
import { ESyncOperation, ESyncStatus } from '@/models/enums/expense.enum';

// Resolve a categoryId (could be localId string or serverId uuid) to a Supabase uuid
const resolveServerId = async (
  categoryId: string,
): Promise<null | string> => {
  // Already a uuid
  if (categoryId.includes('-')) return categoryId;
  // It's a localId — look up serverId from IndexedDB
  const localId = Number(categoryId);
  if (Number.isNaN(localId)) return null;
  const cat = await db.categories.get(localId);
  return cat?.serverId ?? null;
};

interface IState {
  addExpense: (
    data: Omit<
      ILocalExpense,
      'createdAt' | 'localId' | 'serverId' | 'syncStatus' | 'updatedAt'
    >,
  ) => Promise<void>;
  deleteExpense: (localId: number) => Promise<void>;
  expenses: ILocalExpense[];
  filter: TExpenseFilter;
  loadExpenses: (userId: string) => Promise<void>;
  recentExpenses: ILocalExpense[];
  setFilter: (filter: Partial<TExpenseFilter>) => void;
  updateExpense: (
    localId: number,
    data: Partial<ILocalExpense>,
  ) => Promise<void>;
}

export const useExpenseStore = create<IState>()(
  devtools((set, get) => ({
    addExpense: async (data) => {
      const now = new Date().toISOString();
      const localId = await db.expenses.add({
        ...data,
        createdAt: now,
        serverId: null,
        syncStatus: ESyncStatus.Pending,
        updatedAt: now,
      } as ILocalExpense);

      await addToSyncQueue('expenses', ESyncOperation.Create, {
        amount: data.amount,
        category_id: data.categoryId
          ? await resolveServerId(data.categoryId)
          : null,
        description: data.description,
        expense_date: data.expenseDate,
        note: data.note,
        user_id: data.userId,
      });

      void localId;
      await get().loadExpenses(data.userId);

      // Sync immediately if online
      if (navigator.onLine) {
        processSyncQueue().catch(() => {});
      }
    },

    deleteExpense: async (localId) => {
      const expense = await db.expenses.get(localId);
      if (!expense) return;

      await db.expenses.delete(localId);

      if (expense.serverId) {
        await addToSyncQueue(
          'expenses',
          ESyncOperation.Delete,
          {},
          expense.serverId,
        );
      }

      set({
        expenses: get().expenses.filter((e) => e.localId !== localId),
        recentExpenses: get().recentExpenses.filter(
          (e) => e.localId !== localId,
        ),
      });
    },

    expenses: [],

    filter: {},

    loadExpenses: async (userId) => {
      const { filter } = get();
      const collection = db.expenses
        .where('userId')
        .equals(userId);

      let results = await collection.reverse().sortBy('createdAt');

      // Apply filters
      if (filter.dateRange) {
        const start = dayjs(filter.dateRange.start)
          .startOf('day')
          .toISOString();
        const end = dayjs(filter.dateRange.end)
          .endOf('day')
          .toISOString();
        results = results.filter(
          (e) => e.expenseDate >= start && e.expenseDate <= end,
        );
      }

      if (filter.categoryId) {
        results = results.filter(
          (e) => e.categoryId === filter.categoryId,
        );
      }

      if (filter.amountMin !== undefined) {
        results = results.filter(
          (e) => e.amount >= filter.amountMin!,
        );
      }

      if (filter.amountMax !== undefined) {
        results = results.filter(
          (e) => e.amount <= filter.amountMax!,
        );
      }

      if (filter.search) {
        const search = filter.search.toLowerCase();
        results = results.filter((e) =>
          e.description?.toLowerCase().includes(search),
        );
      }

      const recent = results.slice(0, 5);

      set({ expenses: results, recentExpenses: recent });
    },

    recentExpenses: [],

    setFilter: (filter) => {
      set({ filter: { ...get().filter, ...filter } });
    },

    updateExpense: async (localId, data) => {
      const now = new Date().toISOString();
      await db.expenses.update(localId, {
        ...data,
        syncStatus: ESyncStatus.Pending,
        updatedAt: now,
      });

      const expense = await db.expenses.get(localId);
      if (expense?.serverId) {
        await addToSyncQueue(
          'expenses',
          ESyncOperation.Update,
          {
            amount: data.amount,
            category_id: data.categoryId,
            description: data.description,
            expense_date: data.expenseDate,
            note: data.note,
          },
          expense.serverId,
        );
      }

      if (expense) await get().loadExpenses(expense.userId);
    },
  })),
);
