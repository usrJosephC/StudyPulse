import { useState } from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Button } from './Button';
import { EmailInput } from './EmailInput';
import { PasswordInput } from './PasswordInput';
import { NameInput } from './NameInput';
import { ConfirmPasswordInput } from './ConfirmPasswordInput';
import { BirthDateInput } from './BirthDateInput';
import { GenderInput } from './GenderInput';

import { signUpSchema } from '../validation/schemas';
import type { RegisterFormData } from '../validation/schemas';

import { colors, fonts, spacing } from '../theme';

type Props = {
  onRegisterSuccess?: () => void;
};

export function Register({
  onRegisterSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

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
    try {
      setIsLoading(true);

      // Mock temporário: simula uma resposta do backend.
      await new Promise((resolve) =>
        setTimeout(resolve, 800)
      );

      console.log('Mock register:', {
        name: data.name,
        email: data.email,
        birthDate: data.birthDate,
        gender: data.gender,
      });

      // Simula um cadastro realizado com sucesso.
      onRegisterSuccess?.();
    } catch (error) {
      Alert.alert(
        'Error',
        'An error occurred while creating your account.'
      );
    } finally {
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
        Date of birth
      </Text>

      <BirthDateInput
        control={control}
        errors={errors}
      />

      <Text style={styles.sectionTitle}>
        Gender
      </Text>

      <GenderInput
        control={control}
        errors={errors}
      />

      <Button
        label={
          isLoading
            ? 'Creating account...'
            : 'Create Account'
        }
        onPress={handleSubmit(onSubmit)}
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