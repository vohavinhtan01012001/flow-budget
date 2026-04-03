import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '@/assets/styles/components/expense/dashboard.module.scss';

interface IProps {
  onChange: (month: dayjs.Dayjs) => void;
  value: dayjs.Dayjs;
}

export const MonthPicker: React.FC<IProps> = ({ onChange, value }) => {
  const { t } = useTranslation();
  const pickerRef = useRef<HTMLSpanElement>(null);

  const label = value.format('MM/YYYY');

  return (
    <span className={styles['month-picker']} ref={pickerRef}>
      {/* Hidden trigger — the visible label is clickable */}
      <DatePicker
        onChange={(d) => d && onChange(d)}
        open={false}
        picker="month"
        style={{ display: 'none' }}
        value={value}
      />
      {/* Prev month */}
      <button
        className={styles['month-picker__chevron']}
        onClick={() => onChange(value.subtract(1, 'month'))}
        title={t('expense.prevMonth')}
        type="button"
      >
        <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>

      {/* Label — opens native month picker via label click */}
      <button
        className={styles['month-picker__label']}
        onClick={() => {
          const input = pickerRef.current?.querySelector(
            'input',
          ) as HTMLInputElement | null;
          input?.click();
        }}
        type="button"
      >
        {label}
        <svg
          className={styles['month-picker__caret']}
          fill="none"
          height="12"
          viewBox="0 0 24 24"
          width="12"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>

      {/* Next month */}
      <button
        className={styles['month-picker__chevron']}
        onClick={() => onChange(value.add(1, 'month'))}
        title={t('expense.nextMonth')}
        type="button"
      >
        <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
          <path
            d="M9 18l6-6-6-6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>
    </span>
  );
};
