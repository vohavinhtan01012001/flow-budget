import dayjs from 'dayjs';

import type { TCategoryStats, TDailyStats } from '@/models/types/expense.type';

import styles from '@/assets/styles/components/expense/dashboard.module.scss';
import { ChartBarDaily } from '@/components/expense/ChartBarDaily';
import { ChartLineMonthly } from '@/components/expense/ChartLineMonthly';
import { ChartPieCategory } from '@/components/expense/ChartPieCategory';
import { MonthPicker } from '@/components/expense/MonthPicker';
import { StatsSummary } from '@/components/expense/StatsSummary';
import { db } from '@/libs/dexie/db';
import { useAuthStore } from '@/stores/auth.store';
import { useCategoryStore } from '@/stores/category.store';
import { formatVND } from '@/utils/expense-parser.util';

export const Dashboard: React.FC = () => {
  const userInfo = useAuthStore((s) => s.userInfo);
  const categories = useCategoryStore((s) => s.categories);
  const loadCategories = useCategoryStore((s) => s.loadCategories);

  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [todayTotal, setTodayTotal] = useState(0);
  const [weekTotal, setWeekTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [categoryStats, setCategoryStats] = useState<TCategoryStats[]>([]);
  const [dailyStats, setDailyStats] = useState<TDailyStats[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<TDailyStats[]>([]);

  const loadStats = async () => {
    if (!userInfo?.id) return;

    const allExpenses = await db.expenses
      .where('userId')
      .equals(userInfo.id)
      .toArray();

    const today = dayjs().startOf('day');
    const weekStart = dayjs().startOf('week');
    const monthStart = selectedMonth.startOf('month');

    // Totals
    const todayExp = allExpenses.filter((e) =>
      dayjs(e.expenseDate).isSame(today, 'day'),
    );
    const weekExp = allExpenses.filter((e) =>
      dayjs(e.expenseDate).isAfter(weekStart),
    );
    const monthExp = allExpenses.filter((e) =>
      dayjs(e.expenseDate).isAfter(monthStart) &&
      dayjs(e.expenseDate).isBefore(selectedMonth.endOf('month').add(1, 'day')),
    );

    setTodayTotal(todayExp.reduce((s, e) => s + e.amount, 0));
    setWeekTotal(weekExp.reduce((s, e) => s + e.amount, 0));
    setMonthTotal(monthExp.reduce((s, e) => s + e.amount, 0));

    // Category stats (selected month)
    const catMap = new Map<string, number>();
    monthExp.forEach((e) => {
      const key = e.categoryId ?? 'other';
      catMap.set(key, (catMap.get(key) ?? 0) + e.amount);
    });

    const totalMonth = monthExp.reduce((s, e) => s + e.amount, 0);
    const stats: TCategoryStats[] = Array.from(catMap.entries())
      .map(([catId, amount]) => {
        const cat = categories.find(
          (c) =>
            c.serverId === catId || String(c.localId) === catId,
        );
        return {
          amount,
          categoryId: catId,
          categoryName: cat?.name ?? 'Khác',
          color: cat?.color ?? '#AEB6BF',
          count: monthExp.filter(
            (e) => (e.categoryId ?? 'other') === catId,
          ).length,
          icon: cat?.icon ?? '📦',
          percentage: totalMonth > 0 ? (amount / totalMonth) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    setCategoryStats(stats);

    // Daily stats — all days in selected month
    const daysInMonth = selectedMonth.daysInMonth();
    const daily: TDailyStats[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = selectedMonth.date(d);
      const dayExp = allExpenses.filter((e) =>
        dayjs(e.expenseDate).isSame(date, 'day'),
      );
      daily.push({
        amount: dayExp.reduce((s, e) => s + e.amount, 0),
        date: date.toISOString(),
      });
    }
    setDailyStats(daily);

    // Monthly trend — daily for selected month
    const monthly: TDailyStats[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = selectedMonth.date(d);
      const dayExp = allExpenses.filter((e) =>
        dayjs(e.expenseDate).isSame(date, 'day'),
      );
      monthly.push({
        amount: dayExp.reduce((s, e) => s + e.amount, 0),
        date: date.toISOString(),
      });
    }
    setMonthlyStats(monthly);
  };

  useEffect(() => {
    if (userInfo?.id) {
      loadCategories(userInfo.id);
    }
  }, [userInfo?.id]);

  useEffect(() => {
    loadStats();
  }, [userInfo?.id, categories.length, selectedMonth]);

  return (
    <div className={styles['dashboard-page']}>
      <div className={styles['dashboard-page__month-picker-row']}>
        <MonthPicker onChange={setSelectedMonth} value={selectedMonth} />
        <StatsSummary
          stats={[
            {
              label: 'Tháng này',
              sub: selectedMonth.format('MM/YYYY'),
              value: formatVND(monthTotal),
            },
            {
              label: 'Hôm nay',
              value: formatVND(todayTotal),
            },
            {
              label: 'Tuần này',
              value: formatVND(weekTotal),
            },
          ]}
        />
      </div>

      <div className={styles['dashboard-page__section']}>
        <h3>Chi tiêu theo danh mục</h3>
        <ChartPieCategory data={categoryStats} />
      </div>

      <div className={styles['dashboard-page__section']}>
        <h3>{selectedMonth.format('MM/YYYY')}</h3>
        <ChartBarDaily data={dailyStats} />
      </div>

      <div className={styles['dashboard-page__section']}>
        <h3>Xu hướng tháng</h3>
        <ChartLineMonthly data={monthlyStats} />
      </div>
    </div>
  );
};
