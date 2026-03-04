import { notification } from 'antd';
import dayjs from 'dayjs';

import { db } from '@/libs/dexie/db';
import { useAuthStore } from '@/stores/auth.store';
import { useBudgetStore } from '@/stores/budget.store';
import { formatVND } from '@/utils/expense-parser.util';

export const useBudgetAlert = () => {
  const userInfo = useAuthStore((s) => s.userInfo);
  const budgets = useBudgetStore((s) => s.budgets);

  const checkBudgets = useCallback(async () => {
    if (!userInfo?.id) return;

    const expenses = await db.expenses
      .where('userId')
      .equals(userInfo.id)
      .toArray();

    budgets.forEach((budget) => {
      let start: dayjs.Dayjs;
      switch (budget.period) {
        case 'daily':
          start = dayjs().startOf('day');
          break;
        case 'weekly':
          start = dayjs().startOf('week');
          break;
        default:
          start = dayjs().startOf('month');
      }

      const filtered = expenses.filter((e) => {
        const matchDate = dayjs(e.expenseDate).isAfter(start);
        const matchCat = budget.categoryId
          ? e.categoryId === budget.categoryId
          : true;
        return matchDate && matchCat;
      });

      const spent = filtered.reduce((s, e) => s + e.amount, 0);
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      if (percentage >= 100) {
        notification.error({
          description: `Đã chi ${formatVND(spent)} / ${formatVND(budget.amount)}`,
          duration: 5,
          message: 'Vượt ngân sách!',
        });
      } else if (percentage >= 80) {
        notification.warning({
          description: `Đã chi ${percentage.toFixed(0)}% ngân sách (${formatVND(spent)} / ${formatVND(budget.amount)})`,
          duration: 5,
          message: 'Sắp hết ngân sách',
        });
      }
    });
  }, [userInfo?.id, budgets]);

  return { checkBudgets };
};
