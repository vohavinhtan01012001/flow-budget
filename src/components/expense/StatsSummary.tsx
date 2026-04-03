import styles from '@/assets/styles/components/expense/dashboard.module.scss';

interface IProps {
  stats: {
    label: string;
    sub?: string;
    value: string;
  }[];
}

export const StatsSummary: React.FC<IProps> = ({ stats }) => {
  return (
    <div className={styles['dashboard-page__summary']}>
      {stats.map((stat, i) => (
        <div
          className={`${styles['dashboard-page__card']} ${
            i === 0 ? styles['dashboard-page__card--full'] : ''
          }`}
          key={stat.label}
        >
          <div className={styles['dashboard-page__card-label']}>
            {stat.label}
          </div>
          <div className={styles['dashboard-page__card-value']}>
            {stat.value}
          </div>
          {stat.sub && (
            <div className={styles['dashboard-page__card-sub']}>
              {stat.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
