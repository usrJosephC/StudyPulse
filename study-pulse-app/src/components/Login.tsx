import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import axios from 'axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Button } from './Button';
import { EmailInput } from './EmailInput';
import { PasswordInput } from './PasswordInput';

import { colors, fonts, radius, spacing } from '../theme';

import {
  loginSchema,
  type LoginFormData,
} from '../validation/schemas';

type Props = {
  onLoginSuccess?: () => void;
  onCreateAccount?: () => void;
};

export function Login({
  onLoginSuccess,
  onCreateAccount,
}: Props) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // mock temporário enquanto o backend não existe
  async function onSubmit(data: LoginFormData) {
  try {
    setIsLoading(true);

    // simula o tempo de resposta da API
    await new Promise((resolve) =>
      setTimeout(resolve, 800)
    );

    console.log('Mock login:', {
      email: data.email,
    });

    // simula uma resposta de login bem-sucedida
    onLoginSuccess?.();
  } finally {
    setIsLoading(false);
  }
}

  /*
  // Quando o backend estiver pronto, o mock acima
  // poderá ser substituído por esta implementação:

  async function onSubmit(data: LoginFormData) {
    try {
      setIsLoading(true);

      const response = await axios.post(
        'http://localhost:3000/login',
        {
          email: data.email,
          senha: data.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        onLoginSuccess?.();
      }
    } catch (error: any) {
      if (error.response) {
        Alert.alert(
          'Login error',
          error.response.data?.message ||
            'Unable to log in.'
        );
      } else if (error.request) {
        Alert.alert(
          'Connection error',
          'No response from the server.'
        );
      } else {
        Alert.alert(
          'Error',
          'An error occurred while trying to log in.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }
  */

  function handleLogin() {
    if (!acceptedTerms) {
      Alert.alert(
        'Terms of Service',
        'You need to accept the Terms of Service before continuing.'
      );
      return;
    }

    handleSubmit(onSubmit)();
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <EmailInput
          control={control}
          errors={errors}
        />

        <PasswordInput
          control={control}
          errors={errors}
        />

        <Pressable
          onPress={() =>
            Alert.alert(
              'Reset password',
              'This feature is not available yet.'
            )
          }
        >
          <Text style={styles.forgotPassword}>
            Forgot your password?
          </Text>
        </Pressable>

        <Pressable
          style={styles.termsContainer}
          onPress={() =>
            setAcceptedTerms((current) => !current)
          }
        >
          <Ionicons
            name={
              acceptedTerms
                ? 'checkbox'
                : 'square-outline'
            }
            size={18}
            color={colors.secondary}
          />

          <Text style={styles.termsText}>
            I agree to the{' '}

            <Text
              style={styles.termsLink}
              onPress={() => setModalVisible(true)}
            >
              Terms of Service
            </Text>
            .
          </Text>
        </Pressable>

        <Modal
          animationType="fade"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalTitle}>
                  Terms of Service
                </Text>

                <Text style={styles.modalText}>
                  By using StudyPulse, you agree to use the
                  application responsibly and provide accurate
                  information when creating your account.
                </Text>

                <Text style={styles.modalText}>
                  Your account information should be kept
                  secure, and you are responsible for the
                  activity performed through your account.
                </Text>
              </ScrollView>

              <Button
                label="Close"
                onPress={() => setModalVisible(false)}
              />
            </View>
          </View>
        </Modal>

        <Button
          label={
            isLoading
              ? 'Logging in...'
              : 'Log In'
          }
          onPress={handleLogin}
        />

        <Button
          label="Create Account"
          onPress={onCreateAccount}
          variant="outline"
        />

        <Pressable
          style={styles.googleButton}
          onPress={() =>
            Alert.alert(
              'Google Login',
              'This feature is not available yet.'
            )
          }
        >
          <Ionicons
            name="logo-google"
            size={20}
            color={colors.secondary}
          />

          <Text style={styles.googleText}>
            Continue with Google
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  form: {
    gap: spacing.md,
  },

  forgotPassword: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.secondary,
    textAlign: 'right',
    textDecorationLine: 'underline',
    marginTop: -spacing.xs,
  },

  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },

  termsText: {
    flex: 1,
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 17,
  },

  termsLink: {
    fontFamily: fonts.bodyBold,
    color: colors.secondary,
    textDecorationLine: 'underline',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: spacing.xl,
  },

  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
  },

  modalTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: 20,
    color: colors.ink,
    marginBottom: spacing.sm,
  },

  modalText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
    marginBottom: spacing.md,
  },

  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },

  googleText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.secondary,
  },
});