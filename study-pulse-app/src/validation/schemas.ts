import * as yup from 'yup';
import type { TFunction } from 'i18next';

export const loginSchema = (t: TFunction) =>
  yup.object({
    email: yup
      .string()
      .email(t('validation.invalidEmail'))
      .required(t('validation.emailRequired')),

    password: yup
      .string()
      .min(6, t('validation.passwordMin', { min: 6 }))
      .required(t('validation.passwordRequired')),
  });

export type LoginFormData = yup.InferType<
  ReturnType<typeof loginSchema>
>;

export const signUpSchema = (t: TFunction) =>
  yup.object({
    name: yup
      .string()
      .required(t('validation.nameRequired')),

    email: yup
      .string()
      .email(t('validation.invalidEmail'))
      .required(t('validation.emailRequired')),

    password: yup
      .string()
      .min(6, t('validation.passwordMin', { min: 6 }))
      .required(t('validation.passwordRequired')),

    confirmPassword: yup
      .string()
      .oneOf(
        [yup.ref('password')],
        t('validation.passwordsMustMatch')
      )
      .required(t('validation.confirmPasswordRequired')),

    birthDate: yup.object({
      day: yup
        .number()
        .typeError(t('validation.dayRequired'))
        .required(t('validation.dayRequired'))
        .integer(t('validation.invalidDay'))
        .min(1, t('validation.invalidDay'))
        .max(31, t('validation.invalidDay')),

      month: yup
        .number()
        .typeError(t('validation.monthRequired'))
        .required(t('validation.monthRequired'))
        .integer(t('validation.invalidMonth'))
        .min(1, t('validation.invalidMonth'))
        .max(12, t('validation.invalidMonth')),

      year: yup
        .number()
        .typeError(t('validation.yearRequired'))
        .required(t('validation.yearRequired'))
        .integer(t('validation.invalidYear'))
        .min(1900, t('validation.invalidYear'))
        .max(
          new Date().getFullYear(),
          t('validation.invalidYear')
        ),
    }),

    gender: yup
      .string()
      .required(t('validation.genderRequired'))
      .oneOf(
        ['F', 'M', 'Other'],
        t('validation.invalidGender')
      ),
  });

export type RegisterFormData = yup.InferType<
  ReturnType<typeof signUpSchema>
>;