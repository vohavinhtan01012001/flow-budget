import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { db } from '@/libs/dexie/db';

interface IState {
  isSyncing: boolean;
  lastSynced: null | string;
  pendingCount: number;
  refreshPendingCount: () => Promise<void>;
  setIsSyncing: (value: boolean) => void;
  setLastSynced: (date: string) => void;
}

export const useSyncStore = create<IState>()(
  devtools((set) => ({
    isSyncing: false,

    lastSynced: null,

    pendingCount: 0,

    refreshPendingCount: async () => {
      const count = await db.syncQueue.count();
      set({ pendingCount: count });
    },

    setIsSyncing: (value) => set({ isSyncing: value }),

    setLastSynced: (date) => set({ lastSynced: date }),
  })),
);
