import { useRef, useState } from 'react';

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

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Button } from './Button';
import { EmailInput } from './EmailInput';
import { PasswordInput } from './PasswordInput';

import {
  colors,
  fonts,
  radius,
  spacing,
} from '../theme';

import {
  loginSchema,
  type LoginFormData,
} from '../validation/schemas';
import { useAuth } from '../context/AuthContext';

type Props = {
  onLoginSuccess?: () => void;
  onCreateAccount?: () => void;
};

export function Login({
  onLoginSuccess,
  onCreateAccount,
}: Props) {
  const { signIn } = useAuth();
  const [acceptedTerms, setAcceptedTerms] =
    useState(false);

  const [termsError, setTermsError] =
    useState(false);

  const [modalVisible, setModalVisible] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);
  const submitInProgress = useRef(false);

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

  async function onSubmit(data: LoginFormData) {
    if (submitInProgress.current) return;
    submitInProgress.current = true;
    try {
      setIsLoading(true);
      const result = await signIn(data.email, data.password);
      if (!result.ok) {
        Alert.alert('Não foi possível entrar', result.error.message);
        return;
      }
      // O AuthProvider muda o navegador quando a sessão é emitida.
    } finally {
      submitInProgress.current = false;
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
      setTermsError(true);
      return;
    }

    setTermsError(false);

    handleSubmit(onSubmit)();
  }

  function handleTermsToggle() {
    setAcceptedTerms((current) => !current);
    setTermsError(false);
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
          disabled={isLoading}
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

        <View>
          <Pressable
            style={styles.termsContainer}
            disabled={isLoading}
            onPress={handleTermsToggle}
          >
            <Ionicons
              name={
                acceptedTerms
                  ? 'checkbox'
                  : 'square-outline'
              }
              size={18}
              color={
                termsError
                  ? colors.danger
                  : colors.secondary
              }
            />

            <Text style={styles.termsText}>
              I agree to the{' '}

              <Text
                style={styles.termsLink}
                onPress={() =>
                  setModalVisible(true)
                }
              >
                Terms of Service
              </Text>
              .
            </Text>
          </Pressable>

          {termsError && (
            <Text style={styles.termsError}>
              You must accept the Terms of Service
              to continue.
            </Text>
          )}
        </View>

        <Modal
          animationType="fade"
          transparent
          visible={modalVisible}
          onRequestClose={() =>
            setModalVisible(false)
          }
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
                  By using StudyPulse, you agree to use
                  the application responsibly and provide
                  accurate information when creating your
                  account.
                </Text>

                <Text style={styles.modalText}>
                  Your account information should be kept
                  secure, and you are responsible for the
                  activity performed through your account.
                </Text>
              </ScrollView>

              <Button
                label="Close"
                onPress={() =>
                  setModalVisible(false)
                }
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
          disabled={isLoading}
        />

        <Button
          label="Create Account"
          onPress={onCreateAccount}
          variant="outline"
          disabled={isLoading}
        />

        <Pressable
          style={styles.googleButton}
          disabled={isLoading}
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

  termsError: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.xs,
    marginLeft: spacing.xl,
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
