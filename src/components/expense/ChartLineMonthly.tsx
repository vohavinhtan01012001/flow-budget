import dayjs from 'dayjs';

import type { TDailyStats } from '@/models/types/expense.type';

import styles from '@/assets/styles/components/expense/dashboard.module.scss';

interface IProps {
  data: TDailyStats[];
}

export const ChartLineMonthly: React.FC<IProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="tw-text-center tw-py-8 tw-text-slate-400 tw-text-sm">
        Chưa có dữ liệu
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount));
  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * 280 + 10;
    const y =
      maxAmount > 0
        ? 100 - (d.amount / maxAmount) * 80
        : 100;
    return { x, y };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Area fill path
  const areaD = `${pathD} L ${points[points.length - 1].x} 110 L ${points[0].x} 110 Z`;

  return (
    <div className={styles['dashboard-page__chart-container']}>
      <svg
        className="tw-w-full"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 300 130"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={areaD}
          fill="url(#lineGradient)"
        />
        <path
          d={pathD}
          fill="none"
          stroke="#0ea5e9"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
        />
        {points.map((p, i) => (
          <circle
            cx={p.x}
            cy={p.y}
            fill="#030612"
            key={i}
            r="4"
            stroke="#0ea5e9"
            strokeWidth="2"
          />
        ))}
        {data.map((d, i) => (
          <text
            fill="var(--text-muted, #94a3b8)"
            fontSize="8"
            fontWeight="500"
            key={i}
            textAnchor="middle"
            x={points[i].x}
            y="125"
          >
            {dayjs(d.date).format('DD')}
          </text>
        ))}
      </svg>
    </div>
  );
};
