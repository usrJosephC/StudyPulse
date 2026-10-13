import { useRef, useState } from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTranslation } from 'react-i18next';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Button } from './Button';
import { EmailInput } from './EmailInput';
import { PasswordInput } from './PasswordInput';
import { NameInput } from './NameInput';
import { ConfirmPasswordInput } from './ConfirmPasswordInput';
import { BirthDateInput } from './BirthDateInput';
import { GenderInput } from './GenderInput';

import {
  signUpSchema,
  type RegisterFormData,
} from '../validation/schemas';

import { colors, fonts, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';

type Props = {
  onRegisterSuccess?: () => void;
};

export function Register({ onRegisterSuccess }: Props) {
  const { t } = useTranslation();
  const { signUp } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const submitInProgress = useRef(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<
    RegisterFormData,
    unknown,
    RegisterFormData
  >({
    resolver: yupResolver(signUpSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      birthDate: {
        day: undefined,
        month: undefined,
        year: undefined,
      },
      gender: '',
    },
  });

  async function onSubmit(data: RegisterFormData) {
    if (submitInProgress.current) return;

    const normalizedName = data.name.trim();

    if (normalizedName.length > 80) {
      Alert.alert(
        t('register.longNameTitle'),
        t('register.longNameMessage')
      );
      return;
    }

    submitInProgress.current = true;

    try {
      setIsLoading(true);

      const birthDate = [
        data.birthDate.year,
        String(data.birthDate.month).padStart(2, '0'),
        String(data.birthDate.day).padStart(2, '0'),
      ].join('-');

      const result = await signUp(
        normalizedName,
        data.email,
        data.password,
        {
          birthDate,
          gender: data.gender,
        }
      );

      if (!result.ok) {
        Alert.alert(
          t('register.registerErrorTitle'),
          result.error.message ||
            t('register.unexpectedError')
        );
        return;
      }

      if (!result.data.session) {
        Alert.alert(
          t('register.confirmEmailTitle'),
          t('register.confirmEmailMessage')
        );
        return;
      }

      // The AuthProvider handles navigation when the session is emitted.
    } catch (error) {
      console.error('Registration error:', error);

      Alert.alert(
        t('common.error'),
        t('register.unexpectedError')
      );
    } finally {
      submitInProgress.current = false;
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <NameInput
        control={control}
        errors={errors}
      />

      <EmailInput
        control={control}
        errors={errors}
      />

      <PasswordInput
        control={control}
        errors={errors}
      />

      <ConfirmPasswordInput
        control={control}
        errors={errors}
      />

      <Text style={styles.sectionTitle}>
        {t('register.birthDate')}
      </Text>

      <BirthDateInput
        control={control}
        errors={errors}
      />

      <Text style={styles.sectionTitle}>
        {t('register.gender')}
      </Text>

      <GenderInput
        control={control}
        errors={errors}
      />

      <Button
        label={
          isLoading
            ? t('register.creatingAccount')
            : t('register.createAccountButton')
        }
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.md,
  },

  sectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.ink,
  },
});