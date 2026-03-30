import type { Dayjs } from 'dayjs';

import { Calendar } from 'antd';
import dayjs from 'dayjs';

import type { ILocalCategory, ILocalExpense } from '@/libs/dexie/db';

import styles from '@/assets/styles/components/expense/expense-calendar.module.scss';
import { SwipeableExpenseItem } from '@/components/expense/SwipeableExpenseItem';
import { formatVND } from '@/utils/expense-parser.util';

interface IProps {
  categories: ILocalCategory[];
  expenses: ILocalExpense[];
  onDelete: (localId: number) => void;
  onEdit: (expense: ILocalExpense) => void;
}

export const ExpenseCalendar: React.FC<IProps> = ({
  categories,
  expenses,
  onDelete,
  onEdit,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format('YYYY-MM-DD'),
  );

  const { expensesByDate, totalsByDate } = useMemo(() => {
    const map = new Map<string, ILocalExpense[]>();
    const totals = new Map<string, number>();
    expenses.forEach((e) => {
      const key = dayjs(e.expenseDate).format('YYYY-MM-DD');
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
      totals.set(key, (totals.get(key) ?? 0) + e.amount);
    });
    return { expensesByDate: map, totalsByDate: totals };
  }, [expenses]);

  const selectedExpenses = expensesByDate.get(selectedDate) ?? [];
  const selectedTotal = selectedExpenses.reduce(
    (s, e) => s + e.amount,
    0,
  );

  const handleSelect = (date: Dayjs, info: { source: string }) => {
    if (info.source === 'date') {
      setSelectedDate(date.format('YYYY-MM-DD'));
    }
  };

  const cellRender = (date: Dayjs) => {
    const key = date.format('YYYY-MM-DD');
    const total = totalsByDate.get(key);
    if (!total) return null;

    return (
      <div className={styles['calendar__amount']}>
        {formatAmountShort(total)}
      </div>
    );
  };

  return (
    <div className={styles['calendar']}>
      <Calendar
        cellRender={cellRender}
        fullscreen={false}
        onSelect={handleSelect}
        value={dayjs(selectedDate)}
      />

      <div className={styles['calendar__detail']}>
        {selectedExpenses.length > 0 ? (
          <>
            <div className={styles['calendar__detail-header']}>
              {dayjs(selectedDate).format('DD/MM/YYYY')} —{' '}
              {formatVND(selectedTotal)} ({selectedExpenses.length}{' '}
              khoản)
            </div>
            {selectedExpenses.map((expense) => (
              <SwipeableExpenseItem
                categories={categories}
                expense={expense}
                key={expense.localId}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </>
        ) : (
          <div className={styles['calendar__empty']}>
            Không có chi tiêu ngày{' '}
            {dayjs(selectedDate).format('DD/MM/YYYY')}
          </div>
        )}
      </div>
    </div>
  );
};
