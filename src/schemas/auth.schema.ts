import { object as yupObject, ref as yupRef, string as yupString } from 'yup';

export const registerSchema = yupObject({
  displayName: yupString()
    .required('Display name is required')
    .matches(REGEXES.DISPLAY_NAME, 'Name can only contain letters and spaces'),
  email: yupString()
    .required('Email is required')
    .matches(REGEXES.EMAIL, 'Invalid email format'),
  password: yupString()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters long'),
  passwordConfirm: yupString()
    .required('Confirm password is required')
    .oneOf([yupRef('password')], 'Passwords must match'),
  username: yupString()
    .required('Username is required')
    .matches(REGEXES.USERNAME, 'Username can only contain letters and numbers'),
});

export const loginSchema = yupObject({
  email: yupString()
    .required('Email is required')
    .matches(REGEXES.EMAIL, 'Invalid email format'),
  password: yupString()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters long'),
});
