import { useRef, useState } from 'react';
import {
  Alert,
  Animated,
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
import { useTranslation } from 'react-i18next';

import { Button } from './Button';
import { EmailInput } from './EmailInput';
import { PasswordInput } from './PasswordInput';
import { fonts, radius, spacing } from '../theme';
import { type Colors } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { loginSchema, type LoginFormData } from '../validation/schemas';
import { useAuth } from '../contexts/AuthContext';
import { logSafeError } from '../lib/logger';
import { useErrorShake } from '../hooks/useErrorShake';

type Props = {
  onLoginSuccess?: () => void;
  onCreateAccount?: () => void;
};

export function Login({ onCreateAccount }: Props) {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const { temaAtual } = useTheme();
  const styles = createStyles(temaAtual);
  const { shake, shakeStyle } = useErrorShake();
  const [isLoading, setIsLoading] =
    useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const submitInProgress = useRef(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema(t)),
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
      const result = await signIn(
        data.email,
        data.password
      );
      if (!result.ok) {
        const errorMessage =
          result.error.message === 'invalid_credentials'
            ? t('login.invalidCredentials')
            : result.error.message || t('login.unexpectedError');
        shake(errorMessage);
        Alert.alert(t('login.loginErrorTitle'), errorMessage);
        return;
      }
      // The AuthProvider handles navigation when the session is emitted.
    } catch {
      logSafeError('auth.login_failed');
      shake(t('login.unexpectedError'));
      Alert.alert(
        t('common.error'),
        t('login.unexpectedError')
      );
    } finally {
      submitInProgress.current = false;
      setIsLoading(false);
    }
  }

  function handleLogin() {
    if (!termsAccepted) {
      setTermsError(true);
      shake(t('login.acceptTermsRequired'));
      return;
    }
    setTermsError(false);
    void handleSubmit(onSubmit, () => {
      shake(t('common.formInvalid'));
    })();
  }
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.form, shakeStyle]}>
        <EmailInput
          control={control}
          errors={errors}
        />
        <PasswordInput
          control={control}
          errors={errors}
        />
        <View style={styles.termsContainer}>
          <Pressable
            style={styles.termsCheckbox}
            onPress={() => {
              setTermsAccepted((accepted) => !accepted);
              setTermsError(false);
            }}
            disabled={isLoading}
            accessibilityRole="checkbox"
            accessibilityLabel={`${t('login.termsAgreementStart')} ${t('login.termsOfService')}`}
            accessibilityState={{ checked: termsAccepted, disabled: isLoading }}
          >
            <Ionicons
              name={termsAccepted ? 'checkbox' : 'square-outline'}
              size={20}
              color={termsAccepted ? temaAtual.secondary : temaAtual.inkMuted}
            />
          </Pressable>
          <Text style={styles.termsText}>
            {t('login.termsAgreementStart')}{' '}
            <Text
              style={styles.termsLink}
              onPress={() => setTermsVisible(true)}
              accessibilityRole="link"
            >
              {t('login.termsOfService')}
            </Text>
            {t('login.termsAgreementEnd')}
          </Text>
        </View>
        {termsError && (
          <Text style={styles.termsError} accessibilityRole="alert">
            {t('login.acceptTermsRequired')}
          </Text>
        )}
        <Pressable
          disabled={isLoading}
          onPress={() =>
            Alert.alert(
              t('login.resetPasswordTitle'),
              t('login.resetPasswordMessage')
            )
          }
        >
          <Text style={styles.forgotPassword}>
            {t('login.forgotPassword')}
          </Text>
        </Pressable>
        {/* Login button */}
        <Button
          label={
            isLoading
              ? t('login.loggingIn')
              : t('login.loginButton')
          }
          onPress={handleLogin}
          disabled={isLoading}
        />
        {/* Create account button */}
        <Button
          label={t('login.createAccountButton')}
          onPress={onCreateAccount}
          variant="outline"
          disabled={isLoading}
        />
        {/* Google login */}
        <Pressable
          style={styles.googleButton}
          disabled={isLoading}
          onPress={() =>
            Alert.alert(
              t('login.googleLoginTitle'),
              t('login.googleLoginUnavailable')
            )
          }
        >
          <Ionicons
            name="logo-google"
            size={20}
            color={temaAtual.secondary}
          />
          <Text style={styles.googleText}>
            {t('login.googleLoginButton')}
          </Text>
        </Pressable>
      </Animated.View>
      <Modal
        visible={termsVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTermsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('login.termsTitle')}</Text>
            <ScrollView>
              <Text style={styles.modalText}>
                {t('login.termsContent.paragraph1')}
                {'\n\n'}
                {t('login.termsContent.paragraph2')}
              </Text>
            </ScrollView>
            <Pressable
              onPress={() => setTermsVisible(false)}
              style={styles.modalCloseButton}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <Text style={styles.modalCloseText}>{t('common.close')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  container: {
    width: '100%',
  },
  form: {
    gap: spacing.md,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  themeToggleText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.secondary,
  },
  languageLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.inkMuted,
  },
  languageOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  languageOption: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  languageOptionSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  languageOptionText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.inkMuted,
  },
  languageOptionTextSelected: {
    fontFamily: fonts.bodyBold,
    color: colors.card,
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
    alignItems: 'center',
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
  termsCheckbox: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalCloseButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.secondary,
  },
  modalCloseText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.card,
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
