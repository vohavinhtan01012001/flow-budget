import {
  theme as antTheme,
  ConfigProvider,
  ConfigProviderProps,
  type ThemeConfig,
} from 'antd';
import { App as AntApp } from 'antd';
import enUS from 'antd/locale/en_US';

import { DEFAULT } from '@/constants/theme-colors.const';
import { useTheme } from '@/hooks/shared/use-theme';
import { useThemeColor } from '@/hooks/shared/use-theme-color';

interface IProps {
  children: React.ReactNode;
}

type TLocale = ConfigProviderProps['locale'];

export const AntConfigProvider: React.FC<IProps> = ({ children }) => {
  const { isDark } = useTheme();
  const { getThemeColor } = useThemeColor();
  const [locale, _setLocale] = useState<TLocale>(enUS);

  const config: ThemeConfig = {
    algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    components: {
      Button: {
        borderRadius: 12,
        controlHeight: 44,
        primaryShadow: '',
      },
      Input: {
        borderRadius: 14,
      },
      Layout: {
        headerHeight: '75px',
      },
      Menu: {
        darkItemBg: '#0f172a',
      },
      Modal: {
        borderRadiusLG: 16,
      },
      Table: {
        borderColor: getThemeColor('BORDER'),
      },
    },
    cssVar: false,
    hashed: false,
    token: {
      borderRadius: 12,
      colorBgContainer: getThemeColor('BACKGROUND_CONTAINER'),
      colorBgElevated: getThemeColor('BACKGROUND_ELEVATED'),
      colorBorder: getThemeColor('BORDER'),
      colorPrimary: DEFAULT.PRIMARY,
      colorText: getThemeColor('TEXT'),
      colorTextPlaceholder: getThemeColor('TEXT_PLACEHOLDER'),
      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
    },
  };

  return (
    <ConfigProvider locale={locale} theme={config}>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
};
