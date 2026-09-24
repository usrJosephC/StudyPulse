import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email.')
    .required('Email is required.'),

  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters.')
    .required('Password is required.'),
});

export const signUpSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required.'),

  email: yup
    .string()
    .email('Please enter a valid email.')
    .required('Email is required.'),

  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters.')
    .required('Password is required.'),

  confirmPassword: yup
    .string()
    .oneOf(
      [yup.ref('password')],
      'Passwords must match.'
    )
    .required('Please confirm your password.'),

  birthDate: yup.object({
    day: yup
      .number()
      .required('Day is required.')
      .min(1, 'Please enter a valid day.')
      .max(31, 'Please enter a valid day.'),

    month: yup
      .number()
      .required('Month is required.')
      .min(1, 'Please enter a valid month.')
      .max(12, 'Please enter a valid month.'),

    year: yup
      .number()
      .required('Year is required.')
      .min(1900, 'Please enter a valid year.')
      .max(
        new Date().getFullYear(),
        'Please enter a valid year.'
      ),
  }),

  gender: yup
    .string()
    .required('Gender is required.')
    .oneOf(
      ['F', 'M', 'Other'],
      'Please select a valid gender.'
    ),
});

export type RegisterFormData =
  yup.InferType<typeof signUpSchema>;