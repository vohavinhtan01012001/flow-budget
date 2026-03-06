import type { Dayjs } from 'dayjs';

import { Badge, Calendar } from 'antd';
import dayjs from 'dayjs';

import type { ILocalCategory, ILocalExpense } from '@/libs/dexie/db';

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

  // Group expenses by date for badge rendering
  const expensesByDate = useMemo(() => {
    const map = new Map<string, ILocalExpense[]>();
    expenses.forEach((e) => {
      const key = dayjs(e.expenseDate).format('YYYY-MM-DD');
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    });
    return map;
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
    const items = expensesByDate.get(key);
    if (!items?.length) return null;

    const total = items.reduce((s, e) => s + e.amount, 0);

    return (
      <div className="tw-text-center">
        <Badge
          color="var(--danger)"
          count={items.length}
          size="small"
        />
        <div
          style={{
            color: 'var(--danger)',
            fontSize: 9,
            fontWeight: 600,
            lineHeight: 1,
            marginTop: 2,
          }}
        >
          {total >= 1_000_000
            ? `${(total / 1_000_000).toFixed(1)}M`
            : total >= 1_000
              ? `${(total / 1_000).toFixed(0)}K`
              : formatVND(total)}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Calendar
        cellRender={cellRender}
        fullscreen={false}
        onSelect={handleSelect}
        value={dayjs(selectedDate)}
      />

      {selectedExpenses.length > 0 ? (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              color: 'var(--text-muted)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.04em',
              marginBottom: 8,
              paddingLeft: 4,
              textTransform: 'uppercase',
            }}
          >
            {dayjs(selectedDate).format('DD/MM/YYYY')} —{' '}
            {formatVND(selectedTotal)}
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
        </div>
      ) : (
        <div
          style={{
            color: 'var(--text-muted)',
            fontSize: 14,
            padding: '24px 0',
            textAlign: 'center',
          }}
        >
          Không có chi tiêu ngày{' '}
          {dayjs(selectedDate).format('DD/MM/YYYY')}
        </div>
      )}
    </div>
  );
};
