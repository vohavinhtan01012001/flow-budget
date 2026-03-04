import {
  boolean as yupBoolean,
  object as yupObject,
  ref as yupRef,
  string as yupString,
} from 'yup';

export const codebaseSchema = yupObject({
  email: yupString()
    .required('Email is required')
    .matches(REGEXES.EMAIL, 'Invalid email format'),
  fullName: yupString()
    .required('Full name is required')
    .matches(REGEXES.DISPLAY_NAME, 'Name can only contain letters and spaces'),
  password: yupString()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters long'),
  passwordConfirm: yupString()
    .required('Password confirmation is required')
    .oneOf([yupRef('password')], 'Passwords must match'),
  terms: yupBoolean()
    .required()
    .isTrue('You must agree to the terms and conditions'),
  type: yupString().required('Account type is required'),
});
