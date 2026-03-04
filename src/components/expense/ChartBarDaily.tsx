import dayjs from 'dayjs';

import type { TDailyStats } from '@/models/types/expense.type';

import styles from '@/assets/styles/components/expense/dashboard.module.scss';
import { formatAmountShort } from '@/utils/expense-parser.util';

interface IProps {
  data: TDailyStats[];
}

export const ChartBarDaily: React.FC<IProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="tw-text-center tw-py-8 tw-text-slate-400 tw-text-sm">
        Chưa có dữ liệu
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount));
  const isToday = (date: string) => dayjs(date).isSame(dayjs(), 'day');

  return (
    <div className={styles['dashboard-page__chart-container']}>
      <div className="tw-flex tw-items-end tw-gap-2 tw-h-36">
        {data.map((item) => {
          const height =
            maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
          const today = isToday(item.date);
          return (
            <div
              className="tw-flex-1 tw-flex tw-flex-col tw-items-center tw-gap-1"
              key={item.date}
            >
              <span className="tw-text-[10px] tw-font-medium" style={{ color: 'var(--text-muted)' }}>
                {item.amount > 0 ? formatAmountShort(item.amount) : ''}
              </span>
              <div
                className="tw-w-full tw-rounded-lg tw-min-h-[4px]"
                style={{
                  background:
                    item.amount > 0
                      ? today
                        ? '#0ea5e9'
                        : 'var(--accent-medium)'
                      : 'var(--border-color)',
                  height: `${Math.max(height, 4)}%`,
                  transition: 'height 0.4s ease',
                }}
              />
              <span
                className="tw-text-[10px] tw-font-medium"
                style={{
                  color: today ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {dayjs(item.date).format('DD/MM')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
