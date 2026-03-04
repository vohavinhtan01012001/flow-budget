import { Avatar, Badge, MenuProps } from 'antd';
import { Bell, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router';

import styles from '@/assets/styles/components/shared/the-topbar.module.scss';
import { BaseDropdown } from '@/components/shared/BaseDropdown';
import { TheBreadcrumb } from '@/components/shared/TheBreadcrumb';
import { AUTH_PAGES } from '@/constants/route-pages.const';
import { useLanguage } from '@/hooks/shared/use-language';
import { useTheme } from '@/hooks/shared/use-theme';
import { notifications } from '@/mocks/the-topbar.mock';
import { ELanguageCode } from '@/models/enums/shared.enum';
import { useAuthStore } from '@/stores/auth.store';

export const TheTopbar: React.FC = () => {
  const { changeTheme, isDark } = useTheme();
  const { language, setLanguage } = useLanguage();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const i18nOptions = Object.entries(ELanguageCode).map(([key, value]) => ({
    label: key,
    value,
  }));

  const notificationMenu: MenuProps = {
    items: [
      ...notifications.map((notification) => ({
        key: notification.id,
        label: (
          <>
            <p>{notification.message}</p>
            <p>{notification.time}</p>
          </>
        ),
      })),
      {
        key: 'clear-all',
        label: <p>Clear All</p>,
      },
    ],
  };

  const languageFlagMap: Record<ELanguageCode, string> = {
    [ELanguageCode.English]: '🇺🇸',
    [ELanguageCode.Japanese]: '🇯🇵',
    [ELanguageCode.Vietnamese]: '🇻🇳',
  };

  const languageMenu: MenuProps = {
    items: i18nOptions.map((item) => ({
      key: item.value,
      label: (
        <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
          <span>{languageFlagMap[item.value]}</span>
          <p>{item.label}</p>
        </div>
      ),
      onClick: () => setLanguage(item.value),
    })),
  };

  const handleLogout = async () => {
    logout();
    await navigate(AUTH_PAGES.LOGIN);
  };

  return (
    <div className={styles['container']}>
      <section className="tw-flex-center">
        <TheBreadcrumb />
      </section>

      <section className={styles['container__menu']}>
        <span className="tw-cursor-pointer" onClick={changeTheme}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </span>

        <BaseDropdown menu={languageMenu}>
          <span className="tw-cursor-pointer">{languageFlagMap[language]}</span>
        </BaseDropdown>

        <BaseDropdown menu={notificationMenu}>
          <Badge count={notifications.length}>
            <Bell className="tw-cursor-pointer" size={20} />
          </Badge>
        </BaseDropdown>

        <BaseDropdown
          menu={{
            items: [
              { key: 'profile', label: 'Profile' },
              { key: 'settings', label: 'Settings' },
              { type: 'divider' },
              { key: 'logout', label: 'Logout', onClick: () => handleLogout() },
            ],
          }}
        >
          <Avatar className="tw-cursor-pointer">H</Avatar>
        </BaseDropdown>
      </section>
    </div>
  );
};
