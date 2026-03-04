import type { Dayjs } from 'dayjs';

export type TCategoryStats = {
  amount: number;
  categoryId: string;
  categoryName: string;
  color: null | string;
  count: number;
  icon: null | string;
  percentage: number;
};

export type TDailyStats = {
  amount: number;
  date: string;
};

export type TDateRange = {
  end: Date | Dayjs | string;
  start: Date | Dayjs | string;
};

export type TExpenseFilter = {
  amountMax?: number;
  amountMin?: number;
  categoryId?: string;
  dateRange?: TDateRange;
  search?: string;
};

export type TExpenseInput = {
  amount: number;
  categoryId: null | string;
  description: string;
  expenseDate: string;
  note?: string;
};

export type TParsedExpense = {
  amount: number;
  categoryKeyword: null | string;
  description: string;
  rawInput: string;
};
