import { Menu } from 'antd';
import { FolderOpen, LayoutDashboard, Settings, Wallet } from 'lucide-react';
import { Link } from 'react-router';

import styles from '@/assets/styles/components/shared/the-sidebar.module.scss';
import { CODEBASE, HOME } from '@/constants/route-pages.const';
import { AUTH_PAGES } from '@/constants/route-pages.const';
import { useTheme } from '@/hooks/shared/use-theme';

export const TheSidebar: React.FC = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      icon: <LayoutDashboard size={18} />,
      key: AUTH_PAGES.LOGIN,
      label: t('shared.navigator.login'),
    },
    {
      icon: <Settings size={18} />,
      key: AUTH_PAGES.REGISTER,
      label: t('shared.navigator.register'),
    },
    {
      icon: <FolderOpen size={18} />,
      key: CODEBASE,
      label: t('shared.navigator.codebase'),
    },
  ];
  const selectedKey =
    menuItems.find((item) => item.key === location.pathname)?.key || '';

  return (
    <div className={styles['container']}>
      <div className={styles['container__logo']}>
        <Link to={HOME}>
          <Wallet size={28} />
        </Link>
      </div>

      <Menu
        items={menuItems.map((item) => ({
          icon: item.icon,
          key: item.key,
          label: item.label,
        }))}
        mode="inline"
        onClick={({ key }) => navigate(key)}
        selectedKeys={[selectedKey]}
        theme={isDark ? 'dark' : 'light'}
      />
    </div>
  );
};
