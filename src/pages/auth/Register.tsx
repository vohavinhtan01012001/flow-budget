import { yupResolver } from '@hookform/resolvers/yup';
import { Form } from 'antd';
import { Asterisk, Eye, EyeOff } from 'lucide-react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { Link } from 'react-router';
import * as yup from 'yup';

import styles from '@/assets/styles/components/auth/register.module.scss';
import { BaseFormItem } from '@/components/shared/BaseFormItem';
import { BaseInput } from '@/components/shared/BaseInput';
import { AUTH_PAGES } from '@/constants/route-pages.const';
import { EToast } from '@/models/enums/shared.enum';
import { useAuthStore } from '@/stores/auth.store';
import { showToast } from '@/utils/shared.util';

interface IRegisterForm {
  email: string;
  password: string;
  passwordConfirm: string;
}

const registerSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  passwordConfirm: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

export const Register: React.FC = () => {
  const registerForm = useForm<IRegisterForm>({
    defaultValues: { email: '', password: '', passwordConfirm: '' },
    mode: 'onChange',
    resolver: yupResolver(registerSchema),
  });
  const navigate = useNavigate();
  const { t } = useTranslation();
  const registerAction = useAuthStore((state) => state.register);

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const onSubmit: SubmitHandler<IRegisterForm> = async (values) => {
    try {
      await registerAction(values.email, values.password);
      showToast('Registration successful! Check your email.', EToast.Success);
      await navigate(AUTH_PAGES.LOGIN);
    } catch (error) {
      const err = error as Error;
      showToast(err.message || 'Registration failed', EToast.Error);
    }
  };

  const renderPasswordIcon = (visible: boolean, toggle: () => void) => {
    return visible
      ? <Eye onClick={toggle} size={20} />
      : <EyeOff onClick={toggle} size={20} />;
  };

  return (
    <div className={styles['page']}>
      <div className={styles['card']}>
        <div className={styles['logo']}>
          <img alt="Flow Budget" src="/logo.png" />
          <span>Flow Budget</span>
        </div>
        <p className={styles['subtitle']}>
          {t('auth.registerSubtitle') || 'Create your account to get started'}
        </p>

        <FormProvider {...registerForm}>
          <Form
            className={styles['form']}
            layout="vertical"
            onFinish={registerForm.handleSubmit(onSubmit)}
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
              <BaseInput placeholder="name@email.com" />
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
                suffix={renderPasswordIcon(showPassword, () =>
                  setShowPassword(!showPassword),
                )}
                type={showPassword ? 'text' : 'password'}
              />
            </BaseFormItem>

            <BaseFormItem
              label={
                <>
                  <span>{t('auth.passwordConfirm')}</span>
                  <Asterisk className="tw-ml-1 tw-text-red-500" size={10} />
                </>
              }
              name="passwordConfirm"
            >
              <BaseInput
                placeholder={t('auth.inputPassword')}
                suffix={renderPasswordIcon(showPasswordConfirm, () =>
                  setShowPasswordConfirm(!showPasswordConfirm),
                )}
                type={showPasswordConfirm ? 'text' : 'password'}
              />
            </BaseFormItem>

            <button className={styles['submitBtn']} type="submit">
              {t('auth.register')}
            </button>
          </Form>
        </FormProvider>

        <div className={styles['footer']}>
          <p>{t('auth.hasAccount')}</p>
          <Link to={AUTH_PAGES.LOGIN}>{t('auth.loginNow')}</Link>
        </div>
      </div>
    </div>
  );
};
