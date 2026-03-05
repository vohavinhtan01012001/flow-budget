import type { ILocalCategory, ILocalExpense } from '@/libs/dexie/db';

import styles from '@/assets/styles/components/expense/expense-input.module.scss';
import { formatVND } from '@/utils/expense-parser.util';

interface IProps {
  categories: ILocalCategory[];
  className?: string;
  expense: ILocalExpense;
}

export const ExpenseListItem: React.FC<IProps> = ({
  categories,
  className,
  expense,
}) => {
  const category = categories.find(
    (c) =>
      c.serverId === expense.categoryId ||
      String(c.localId) === expense.categoryId,
  );

  return (
    <div
      className={`${styles['expense-list-item']} ${className ?? ''}`}
    >
      <div
        className={styles['expense-list-item__icon']}
        style={{ background: category?.color ? `${category.color}20` : '#f0f0f0' }}
      >
        {category?.icon ?? '📦'}
      </div>
      <div className={styles['expense-list-item__info']}>
        <div className={styles['expense-list-item__desc']}>
          {expense.description || 'Chi tiêu'}
        </div>
        <div className={styles['expense-list-item__category']}>
          {category?.name ?? 'Khác'}
        </div>
      </div>
      <div className={styles['expense-list-item__amount']}>
        -{formatVND(expense.amount)}
      </div>
    </div>
  );
};
