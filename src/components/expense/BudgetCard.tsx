import { Progress } from 'antd';

import type { ILocalBudget } from '@/libs/dexie/db';

import styles from '@/assets/styles/components/expense/dashboard.module.scss';
import { formatVND } from '@/utils/expense-parser.util';

interface IProps {
  budget: ILocalBudget;
  categoryName: string;
  icon: string;
  spent: number;
}

const PERIOD_LABELS: Record<string, string> = {
  daily: 'Ngày',
  monthly: 'Tháng',
  weekly: 'Tuần',
};

export const BudgetCard: React.FC<IProps> = ({
  budget,
  categoryName,
  icon,
  spent,
}) => {
  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
  const remaining = Math.max(budget.amount - spent, 0);

  const statusClass =
    percentage >= 100
      ? styles['budget-card--danger']
      : percentage >= 80
        ? styles['budget-card--warning']
        : '';

  const progressColor =
    percentage >= 100 ? 'var(--danger)' : percentage >= 80 ? 'var(--warning)' : 'var(--accent)';

  return (
    <div className={`${styles['budget-card']} ${statusClass}`}>
      <div className={styles['budget-card__header']}>
        <span className={styles['budget-card__name']}>
          {icon} {categoryName}
        </span>
        <span className={styles['budget-card__period']}>
          {PERIOD_LABELS[budget.period] ?? budget.period}
        </span>
      </div>

      <div className={styles['budget-card__progress']}>
        <Progress
          percent={Math.min(percentage, 100)}
          showInfo={false}
          size="small"
          strokeColor={progressColor}
        />
      </div>

      <div className={styles['budget-card__footer']}>
        <span>
          Đã chi: {formatVND(spent)}
        </span>
        <span>
          Còn lại: {formatVND(remaining)}
        </span>
      </div>
    </div>
  );
};
