import dayjs from 'dayjs';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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
  const todayIndex = data.findIndex((d) =>
    dayjs(d.date).isSame(dayjs(), 'day'),
  );

  const chartData = data.map((d, i) => ({
    ...d,
    day: dayjs(d.date).format('DD'),
    isToday: i === todayIndex,
  }));

  return (
    <div className={styles['dashboard-page__chart-container']}>
      <ResponsiveContainer height={144} width="100%">
        <BarChart
          barCategoryGap="10%"
          barSize={8}
          data={chartData}
          margin={{ bottom: 0, left: 0, right: 0, top: 8 }}
        >
          <XAxis
            axisLine={false}
            dataKey="day"
            interval={Math.floor(data.length / 4)}
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            tickLine={false}
          />
          <YAxis
            domain={[0, maxAmount * 1.1]}
            hide
            tickFormatter={(v) => formatAmountShort(v)}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0].payload as (typeof chartData)[number];
              return (
                <div
                  className="tw-rounded-lg tw-px-3 tw-py-2 tw-text-xs tw-shadow-lg"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>
                    {dayjs(item.date).format('DD/MM')}
                  </span>
                  <br />
                  <span className="tw-font-semibold">
                    {item.amount > 0
                      ? formatAmountShort(item.amount)
                      : '—'}
                  </span>
                </div>
              );
            }}
            cursor={false}
          />
          <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                fill={entry.isToday ? '#0ea5e9' : entry.amount > 0 ? 'var(--accent-medium)' : 'var(--border-color)'}
                key={`cell-${index}`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
