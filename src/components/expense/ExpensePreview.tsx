import type { TParsedExpense } from '@/models/types/expense.type';

import styles from '@/assets/styles/components/expense/expense-input.module.scss';
import { formatVND } from '@/utils/expense-parser.util';

interface IProps {
  categoryName: null | string;
  parsed: null | TParsedExpense;
}

export const ExpensePreview: React.FC<IProps> = ({
  categoryName,
  parsed,
}) => {
  if (!parsed) return null;

  return (
    <div className={styles['expense-preview']}>
      <div className={styles['expense-preview__row']}>
        <span className={styles['expense-preview__label']}>Số tiền</span>
        <span
          className={`${styles['expense-preview__value']} ${styles['expense-preview__value--amount']}`}
        >
          {formatVND(parsed.amount)}
        </span>
      </div>
      {parsed.description && (
        <div className={styles['expense-preview__row']}>
          <span className={styles['expense-preview__label']}>Mô tả</span>
          <span className={styles['expense-preview__value']}>
            {parsed.description}
          </span>
        </div>
      )}
      {categoryName && (
        <div className={styles['expense-preview__row']}>
          <span className={styles['expense-preview__label']}>
            Danh mục
          </span>
          <span className={styles['expense-preview__value']}>
            {categoryName}
          </span>
        </div>
      )}
    </div>
  );
};
