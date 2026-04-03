import { BarChart3, ListOrdered, PlusCircle, Settings, Target } from 'lucide-react';
import { NavLink } from 'react-router';

import styles from '@/assets/styles/components/shared/mobile-layout.module.scss';
import { EXPENSE_TABS } from '@/constants/expense.const';
import { EXPENSE_PAGES } from '@/constants/route-pages.const';

const TAB_ROUTES: Record<string, string> = {
  budget: EXPENSE_PAGES.BUDGET,
  dashboard: EXPENSE_PAGES.DASHBOARD,
  history: EXPENSE_PAGES.HISTORY,
  input: EXPENSE_PAGES.INPUT,
  settings: EXPENSE_PAGES.SETTINGS,
};

const TAB_ICONS: Record<string, React.FC<{ size?: number | string }>> = {
  chart: BarChart3,
  list: ListOrdered,
  plus: PlusCircle,
  settings: Settings,
  target: Target,
};

export const BottomTabBar: React.FC = () => {
  return (
    <nav className={styles['bottom-tab-bar']}>
      {EXPENSE_TABS.map((tab) => {
        const Icon = TAB_ICONS[tab.icon];
        return (
          <NavLink
            className={({ isActive }) =>
              `${styles['bottom-tab-bar__item']} ${
                isActive ? styles['bottom-tab-bar__item--active'] : ''
              }`
            }
            end={tab.key === 'input'}
            key={tab.key}
            to={TAB_ROUTES[tab.key]}
          >
            <span className={styles['bottom-tab-bar__item-icon']}>
              {Icon && <Icon size={20} />}
            </span>
            <span className={styles['bottom-tab-bar__item-label']}>
              {tab.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
};
