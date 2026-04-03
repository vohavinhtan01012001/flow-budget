import { yupResolver } from '@hookform/resolvers/yup';
import { Form } from 'antd';
import { Asterisk, Eye, EyeOff } from 'lucide-react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { Link } from 'react-router';

import styles from '@/assets/styles/components/auth/login.module.scss';
import { BaseFormItem } from '@/components/shared/BaseFormItem';
import { BaseInput } from '@/components/shared/BaseInput';
import { AUTH_PAGES, EXPENSE_PAGES } from '@/constants/route-pages.const';
import { SELECTORS } from '@/constants/shared.const';
import { EToast } from '@/models/enums/shared.enum';
import { ILoginRequest } from '@/models/interfaces/auth.interface';
import { loginSchema } from '@/schemas/auth.schema';
import { useAuthStore } from '@/stores/auth.store';
import { showToast } from '@/utils/shared.util';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export const Login: React.FC = () => {
  const loginForm = useForm<ILoginRequest>({
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
    resolver: yupResolver(loginSchema),
  });
  const { t } = useTranslation();
  const loginAction = useAuthStore((state) => state.login);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmit: SubmitHandler<ILoginRequest> = async (values) => {
    try {
      await loginAction(values.email, values.password);
      await navigate(EXPENSE_PAGES.INPUT);
    } catch (error) {
      const err = error as Error;
      showToast(err.message || 'Login failed', EToast.Error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
    } catch (error) {
      const err = error as Error;
      showToast(err.message || 'Google login failed', EToast.Error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const renderIcon = (onClick: () => void) => {
    return showPassword
      ? <Eye onClick={onClick} size={20} />
      : <EyeOff onClick={onClick} size={20} />;
  };

  return (
    <div className={styles['page']}>
      <div className={styles['card']}>
        <div className={styles['logo']}>
          <img alt="Flow Budget" src="/logo.png" />
          <span>Flow Budget</span>
        </div>
        <p className={styles['subtitle']}>{t('auth.loginSubtitle') || 'Sign in to manage your expenses'}</p>

        <button
          className={styles['googleBtn']}
          disabled={googleLoading}
          onClick={handleGoogleLogin}
          type="button"
        >
          <GoogleIcon />
          {googleLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        <div className={styles['divider']}>
          <span>or sign in with email</span>
        </div>

        <FormProvider {...loginForm}>
          <Form
            className={styles['form']}
            id={SELECTORS.LOGIN_SECTION}
            layout="vertical"
            onFinish={loginForm.handleSubmit(onSubmit)}
          >
            <BaseFormItem
              label={
                <>
                  <span>{t('auth.email')}</span>
                  <Asterisk className="tw-ml-1 tw-text-red-500" size={10} />
                </>
              }
              name="email"
            >
              <BaseInput placeholder="name@email.com" type="text" />
            </BaseFormItem>

            <BaseFormItem
              label={
                <>
                  <span>{t('auth.password')}</span>
                  <Asterisk className="tw-ml-1 tw-text-red-500" size={10} />
                </>
              }
              name="password"
            >
              <BaseInput
                placeholder={t('auth.inputPassword')}
                suffix={renderIcon(() => setShowPassword(!showPassword))}
                type={showPassword ? 'text' : 'password'}
              />
            </BaseFormItem>

            <button className={styles['submitBtn']} type="submit">
              {t('auth.login')}
            </button>
          </Form>
        </FormProvider>

        <div className={styles['footer']}>
          <p>{t('auth.noAccount')}</p>
          <Link to={AUTH_PAGES.REGISTER}>{t('auth.registerNow')}</Link>
        </div>
      </div>
    </div>
  );
};
