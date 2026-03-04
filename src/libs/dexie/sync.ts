import { supabase } from '@/libs/supabase/client';
import { ESyncOperation } from '@/models/enums/expense.enum';

import { db, ISyncQueueItem } from './db';

const MAX_RETRIES = 3;

// Use the main supabase client (which has the auth session)
// Cast to `any` for dynamic table names in sync operations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const syncClient = supabase as any;

const processItem = async (item: ISyncQueueItem): Promise<boolean> => {
  const payload = JSON.parse(item.payload);

  try {
    switch (item.operation) {
      case ESyncOperation.Create: {
        const { error } = await syncClient
          .from(item.table)
          .insert(payload);
        if (error) throw error;
        break;
      }
      case ESyncOperation.Delete: {
        if (!item.serverId) break;
        const { error } = await syncClient
          .from(item.table)
          .delete()
          .eq('id', item.serverId);
        if (error) throw error;
        break;
      }
      case ESyncOperation.Update: {
        if (!item.serverId) break;
        const { error } = await syncClient
          .from(item.table)
          .update(payload)
          .eq('id', item.serverId);
        if (error) throw error;
        break;
      }
    }
    return true;
  } catch (error) {
    console.error(`Sync failed for ${item.table}:`, error);
    return false;
  }
};

export const processSyncQueue = async (): Promise<number> => {
  const items = await db.syncQueue.orderBy('createdAt').toArray();
  let processed = 0;

  for (const item of items) {
    const success = await processItem(item);

    if (success) {
      await db.syncQueue.delete(item.id);
      processed++;
    } else if (item.retryCount >= MAX_RETRIES) {
      await db.syncQueue.delete(item.id);
    } else {
      await db.syncQueue.update(item.id, {
        retryCount: item.retryCount + 1,
      });
    }
  }

  return processed;
};

export const addToSyncQueue = async (
  table: string,
  operation: ESyncOperation,
  payload: Record<string, unknown>,
  serverId?: null | string,
) => {
  await db.syncQueue.add({
    createdAt: new Date().toISOString(),
    operation,
    payload: JSON.stringify(payload),
    retryCount: 0,
    serverId: serverId ?? null,
    table,
  } as ISyncQueueItem);
};

export const useAutoSync = () => {
  const intervalRef = useRef<null | ReturnType<typeof setInterval>>(
    null,
  );

  useEffect(() => {
    const sync = async () => {
      if (!navigator.onLine) return;
      const count = await db.syncQueue.count();
      if (count > 0) {
        await processSyncQueue();
      }
    };

    sync();

    intervalRef.current = setInterval(sync, 30_000);

    window.addEventListener('online', sync);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('online', sync);
    };
  }, []);
};
