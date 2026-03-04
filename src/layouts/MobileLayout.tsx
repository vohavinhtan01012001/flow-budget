import { Outlet } from 'react-router';

import styles from '@/assets/styles/components/shared/mobile-layout.module.scss';
import { BottomTabBar } from '@/components/shared/BottomTabBar';

export const MobileLayout: React.FC = () => {
  return (
    <div className={styles['mobile-layout']}>
      <div className={styles['mobile-layout__content']}>
        <Outlet />
      </div>
      <BottomTabBar />
    </div>
  );
};
