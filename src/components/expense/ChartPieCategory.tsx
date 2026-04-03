import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import type { TCategoryStats } from '@/models/types/expense.type';

import styles from '@/assets/styles/components/expense/dashboard.module.scss';
import { formatVND } from '@/utils/expense-parser.util';

interface IProps {
  data: TCategoryStats[];
}

export const ChartPieCategory: React.FC<IProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="tw-text-center tw-py-8 tw-text-slate-400 tw-text-sm">
        Chưa có dữ liệu
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className={styles['dashboard-page__chart-container']}>
      {/* Donut chart */}
      <div className="tw-h-44 tw-mb-4">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie
              cx="50%"
              cy="50%"
              data={data}
              dataKey="amount"
              innerRadius={50}
              nameKey="categoryName"
              outerRadius={80}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((item) => (
                <Cell
                  fill={item.color ?? '#AEB6BF'}
                  key={item.categoryId}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload as TCategoryStats;
                return (
                  <div
                    className="tw-rounded-lg tw-px-3 tw-py-2 tw-text-xs tw-shadow-lg"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                  >
                    <span style={{ color: 'var(--text-primary)' }}>{item.categoryName}</span>
                    <br />
                    <span className="tw-font-semibold tw-text-danger">
                      {formatVND(item.amount)}
                    </span>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend list */}
      <div className="tw-space-y-3">
        {data.map((item) => (
          <div className="tw-flex tw-items-center tw-gap-3" key={item.categoryId}>
            <span className="tw-text-lg tw-w-8 tw-text-center">{item.icon}</span>
            <div className="tw-flex-1 tw-min-w-0">
              <div className="tw-flex tw-justify-between tw-text-sm tw-mb-1.5">
                <span className="tw-font-medium" style={{ color: 'var(--text-primary)' }}>
                  {item.categoryName}
                </span>
                <span className="tw-font-semibold tw-tabular-nums" style={{ color: 'var(--text-primary)' }}>
                  {formatVND(item.amount)}
                </span>
              </div>
              <div
                className="tw-h-2 tw-rounded-full tw-overflow-hidden"
                style={{ background: 'var(--border-color)' }}
              >
                <div
                  className="tw-h-full tw-rounded-full"
                  style={{
                    background: item.color ?? '#0ea5e9',
                    transition: 'width 0.5s ease',
                    width: `${(item.amount / total) * 100}%`,
                  }}
                />
              </div>
            </div>
            <span
              className="tw-text-xs tw-font-semibold tw-w-10 tw-text-right tw-tabular-nums"
              style={{ color: 'var(--text-muted)' }}
            >
              {item.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
