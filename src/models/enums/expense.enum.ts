export enum EBudgetPeriod {
  Daily = 'daily',
  Monthly = 'monthly',
  Weekly = 'weekly',
}

export enum ESyncOperation {
  Create = 'create',
  Delete = 'delete',
  Update = 'update',
}

export enum ESyncStatus {
  Conflict = 'conflict',
  Pending = 'pending',
  Synced = 'synced',
}
