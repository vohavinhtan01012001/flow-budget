import { Button } from 'antd';
import dayjs from 'dayjs';
import { Search } from 'lucide-react';

import type { ILocalExpense } from '@/libs/dexie/db';
import type { TExpenseFilter } from '@/models/types/expense.type';

import styles from '@/assets/styles/components/expense/dashboard.module.scss';
import { ExpenseFilter } from '@/components/expense/ExpenseFilter';
import { SwipeableExpenseItem } from '@/components/expense/SwipeableExpenseItem';
import { useAuthStore } from '@/stores/auth.store';
import { useCategoryStore } from '@/stores/category.store';
import { useExpenseStore } from '@/stores/expense.store';
import { formatVND } from '@/utils/expense-parser.util';
import { exportToCSV, exportToPDF } from '@/utils/export.util';

export const History: React.FC = () => {
  const userInfo = useAuthStore((s) => s.userInfo);
  const expenses = useExpenseStore((s) => s.expenses);
  const filter = useExpenseStore((s) => s.filter);
  const setFilter = useExpenseStore((s) => s.setFilter);
  const loadExpenses = useExpenseStore((s) => s.loadExpenses);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const categories = useCategoryStore((s) => s.categories);
  const loadCategories = useCategoryStore((s) => s.loadCategories);

  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const handleEdit = (expense: ILocalExpense) => {
    navigate(EXPENSE_PAGES.INPUT, { state: { editExpense: expense } });
  };

  useEffect(() => {
    if (userInfo?.id) {
      loadCategories(userInfo.id);
      loadExpenses(userInfo.id);
    }
  }, [userInfo?.id]);

  useEffect(() => {
    if (userInfo?.id) loadExpenses(userInfo.id);
  }, [filter]);

  const handleFilterChange = (partial: Partial<TExpenseFilter>) => {
    setFilter(partial);
  };

  const handleDelete = async (localId: number) => {
    await deleteExpense(localId);
  };

  const handleExportCSV = () => {
    exportToCSV(expenses, categories);
  };

  const handleExportPDF = async () => {
    await exportToPDF(expenses, categories);
  };

  // Group expenses by date
  const grouped = useMemo(() => {
    const map = new Map<string, typeof expenses>();
    expenses.forEach((e) => {
      const key = dayjs(e.expenseDate).format('YYYY-MM-DD');
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    });
    return Array.from(map.entries()).sort(
      (a, b) => b[0].localeCompare(a[0]),
    );
  }, [expenses]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className={styles['history-page']}>
      <div className={styles['history-page__header']}>
        <h2>Lịch sử</h2>
        <div className="tw-flex tw-gap-2">
          <Button onClick={() => setShowFilters(!showFilters)} size="small">
            <Search size={16} />
          </Button>
          <Button onClick={handleExportCSV} size="small">
            CSV
          </Button>
          <Button onClick={handleExportPDF} size="small">
            PDF
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className={styles['history-page__filters']}>
          <ExpenseFilter
            filter={filter}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}

      {expenses.length > 0 && (
        <div className={styles['history-page__total']}>
          Tổng: <strong>{formatVND(total)}</strong> ({expenses.length}{' '}
          khoản)
        </div>
      )}

      {grouped.length === 0 ? (
        <div className={styles['history-page__empty']}>
          Chưa có chi tiêu nào
        </div>
      ) : (
        grouped.map(([date, items]) => (
          <div className={styles['history-page__date-group']} key={date}>
            <div className={styles['history-page__date-group-title']}>
              {dayjs(date).format('DD/MM/YYYY')} —{' '}
              {formatVND(items.reduce((s, e) => s + e.amount, 0))}
            </div>
            {items.map((expense) => (
              <SwipeableExpenseItem
                categories={categories}
                expense={expense}
                key={expense.localId}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
};
