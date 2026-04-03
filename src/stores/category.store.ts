import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { PRESET_CATEGORIES } from '@/constants/expense.const';
import { db, ILocalCategory } from '@/libs/dexie/db';
import { addToSyncQueue } from '@/libs/dexie/sync';
import { ESyncOperation, ESyncStatus } from '@/models/enums/expense.enum';

interface IState {
  addCategory: (
    name: string,
    icon: string,
    color: string,
    userId: string,
  ) => Promise<void>;
  categories: ILocalCategory[];
  deleteCategory: (localId: number) => Promise<void>;
  loadCategories: (userId: null | string) => Promise<void>;
  updateCategory: (
    localId: number,
    data: Partial<ILocalCategory>,
  ) => Promise<void>;
}

let seedingPromise: null | Promise<void> = null;

export const useCategoryStore = create<IState>()(
  devtools((set, get) => ({
    addCategory: async (name, icon, color, userId) => {
      // Check duplicate name
      const existing = get().categories.find(
        (c) => c.name.toLowerCase() === name.toLowerCase(),
      );
      if (existing) {
        throw new Error('DUPLICATE_CATEGORY');
      }

      const localId = await db.categories.add({
        color,
        icon,
        isPreset: false,
        name,
        serverId: null,
        sortOrder: get().categories.length + 1,
        syncStatus: ESyncStatus.Pending,
        userId,
      } as ILocalCategory);

      await addToSyncQueue('categories', ESyncOperation.Create, {
        color,
        icon,
        is_preset: false,
        name,
        sort_order: get().categories.length + 1,
        user_id: userId,
      });

      await get().loadCategories(userId);
      void localId;
    },

    categories: [],

    deleteCategory: async (localId) => {
      const cat = await db.categories.get(localId);
      if (!cat) return;

      await db.categories.delete(localId);

      if (cat.serverId) {
        await addToSyncQueue(
          'categories',
          ESyncOperation.Delete,
          {},
          cat.serverId,
        );
      }

      set({
        categories: get().categories.filter(
          (c) => c.localId !== localId,
        ),
      });
    },

    loadCategories: async (userId) => {
      let all = await db.categories.toArray();

      // Clean up duplicate presets (caused by earlier race condition)
      const presets = all.filter((c) => c.isPreset);
      const seen = new Set<string>();
      const dupeIds: number[] = [];
      for (const p of presets) {
        if (seen.has(p.name)) {
          dupeIds.push(p.localId);
        } else {
          seen.add(p.name);
        }
      }
      if (dupeIds.length > 0) {
        await db.categories.bulkDelete(dupeIds);
        all = await db.categories.toArray();
      }

      // Seed presets if empty — race-safe
      if (all.length === 0) {
        if (!seedingPromise) {
          seedingPromise = (async () => {
            const recheck = await db.categories.count();
            if (recheck === 0) {
              const items = PRESET_CATEGORIES.map(
                (p) =>
                  ({
                    color: p.color,
                    icon: p.icon,
                    isPreset: true,
                    name: p.name,
                    serverId: null,
                    sortOrder: p.sortOrder,
                    syncStatus: ESyncStatus.Synced,
                    userId: null,
                  }) as ILocalCategory,
              );
              await db.categories.bulkAdd(items);
            }
            seedingPromise = null;
          })();
        }
        await seedingPromise;
        all = await db.categories.toArray();
      }

      const filtered = all.filter(
        (c) => c.isPreset || c.userId === userId,
      );

      set({ categories: filtered.sort((a, b) => a.sortOrder - b.sortOrder) });
    },

    updateCategory: async (localId, data) => {
      await db.categories.update(localId, {
        ...data,
        syncStatus: ESyncStatus.Pending,
      });

      const cat = await db.categories.get(localId);
      if (cat?.serverId) {
        await addToSyncQueue(
          'categories',
          ESyncOperation.Update,
          { color: data.color, icon: data.icon, name: data.name },
          cat.serverId,
        );
      }

      const userId = cat?.userId ?? null;
      await get().loadCategories(userId);
    },
  })),
);
