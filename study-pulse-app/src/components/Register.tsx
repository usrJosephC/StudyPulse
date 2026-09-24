import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
// import axios from 'axios';
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

    // mock temporário: simula uma resposta do backend! apenas para testes
    await new Promise((resolve) =>
      setTimeout(resolve, 800)
    );

    Alert.alert(
      'Account created',
      'Your account was created successfully.',
      [
        {
          text: 'Continue',
          onPress: onRegisterSuccess,
        },
      ]
    );
  } catch (error) {
    Alert.alert(
      'Error',
      'An error occurred while creating your account.'
    );
  } finally {
    setIsLoading(false);
  }
}

  // função para quando adicionar backend!!
  // async function onSubmit(data: RegisterFormData) {
  //   const payload = {
  //     nome: data.name,
  //     email: data.email,
  //     senha: data.password,
  //     nascimento: data.birthDate,
  //     genero: data.gender,
  //   };

  //   try {
  //     setIsLoading(true);

  //     const response = await axios.post(
  //       'http://localhost:3000/cadastro',
  //       payload,
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       }
  //     );

  //     if (response.status === 201) {
  //       Alert.alert(
  //         'Account created',
  //         'Your account was created successfully.',
  //         [
  //           {
  //             text: 'Continue',
  //             onPress: onRegisterSuccess,
  //           },
  //         ]
  //       );
  //     }
  //   } catch (error: any) {
  //     if (error.response) {
  //       Alert.alert(
  //         'Registration error',
  //         error.response.data?.message ||
  //           'Unable to create your account.'
  //       );
  //     } else if (error.request) {
  //       Alert.alert(
  //         'Connection error',
  //         'No response from the server.'
  //       );
  //     } else {
  //       Alert.alert(
  //         'Error',
  //         'An error occurred while creating your account.'
  //       );
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

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
  },

  sectionTitle: {
    marginBottom: spacing.sm,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.ink,
  },
});