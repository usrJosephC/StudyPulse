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
import { useTranslation } from 'react-i18next';

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

import {
  changeAppLanguage,
  type AppLanguage,
} from '../i18n';

type Props = {
  onLoginSuccess?: () => void;
  onCreateAccount?: () => void;
};

export function Login({ onCreateAccount }: Props) {
  const { t, i18n } = useTranslation();
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

  const currentLanguage = (
    i18n.resolvedLanguage ?? i18n.language
  ).toLowerCase();

  const selectedLanguage: AppLanguage =
    currentLanguage.startsWith('en')
      ? 'en-US'
      : currentLanguage.startsWith('es')
        ? 'es-ES'
        : 'pt-BR';

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

  async function handleLanguageChange(
    language: AppLanguage
  ) {
    if (language === selectedLanguage) return;

    try {
      await changeAppLanguage(language);
    } catch (error) {
      console.error('Error changing language:', error);

      Alert.alert(
        t('common.error'),
        t('language.saveError')
      );
    }
  }

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
        Alert.alert(
          t('login.loginErrorTitle'),
          result.error.message ||
            t('login.unexpectedError')
        );

        return;
      }

      // The AuthProvider handles navigation when the session is emitted.
    } catch (error) {
      console.error('Login error:', error);

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
        {/* Language selector */}
        <View style={styles.languageContainer}>
          <Text style={styles.languageLabel}>
            {t('language.label')}
          </Text>

          <View
            style={styles.languageOptions}
            accessibilityRole="radiogroup"
            accessibilityLabel={t('language.label')}
          >
            {/* Portuguese */}
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{
                selected: selectedLanguage === 'pt-BR',
              }}
              accessibilityLabel={t('language.portuguese')}
              style={[
                styles.languageOption,
                selectedLanguage === 'pt-BR' &&
                  styles.languageOptionSelected,
              ]}
              disabled={isLoading}
              onPress={() =>
                handleLanguageChange('pt-BR')
              }
            >
              <Text
                style={[
                  styles.languageOptionText,
                  selectedLanguage === 'pt-BR' &&
                    styles.languageOptionTextSelected,
                ]}
              >
                {t('language.portuguese')}
              </Text>
            </Pressable>

            {/* English */}
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{
                selected: selectedLanguage === 'en-US',
              }}
              accessibilityLabel={t('language.english')}
              style={[
                styles.languageOption,
                selectedLanguage === 'en-US' &&
                  styles.languageOptionSelected,
              ]}
              disabled={isLoading}
              onPress={() =>
                handleLanguageChange('en-US')
              }
            >
              <Text
                style={[
                  styles.languageOptionText,
                  selectedLanguage === 'en-US' &&
                    styles.languageOptionTextSelected,
                ]}
              >
                {t('language.english')}
              </Text>
            </Pressable>

            {/* Spanish */}
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{
                selected: selectedLanguage === 'es-ES',
              }}
              accessibilityLabel={t('language.spanish')}
              style={[
                styles.languageOption,
                selectedLanguage === 'es-ES' &&
                  styles.languageOptionSelected,
              ]}
              disabled={isLoading}
              onPress={() =>
                handleLanguageChange('es-ES')
              }
            >
              <Text
                style={[
                  styles.languageOptionText,
                  selectedLanguage === 'es-ES' &&
                    styles.languageOptionTextSelected,
                ]}
              >
                {t('language.spanish')}
              </Text>
            </Pressable>
          </View>
        </View>

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
              t('login.resetPasswordTitle'),
              t('login.resetPasswordMessage')
            )
          }
        >
          <Text style={styles.forgotPassword}>
            {t('login.forgotPassword')}
          </Text>
        </Pressable>

        {/* Terms of Service */}
        <View>
          <Pressable
            style={styles.termsContainer}
            disabled={isLoading}
            onPress={handleTermsToggle}
            accessibilityRole="checkbox"
            accessibilityState={{
              checked: acceptedTerms,
            }}
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
              {t('login.termsAgreementStart')}{' '}

              <Text
                style={styles.termsLink}
                onPress={() => setModalVisible(true)}
              >
                {t('login.termsOfService')}
              </Text>
              {t('login.termsAgreementEnd')}
            </Text>
          </Pressable>

          {termsError && (
            <Text
              accessibilityRole="alert"
              style={styles.termsError}
            >
              {t('login.acceptTermsRequired')}
            </Text>
          )}
        </View>

        {/* Terms modal */}
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
                  {t('login.termsTitle')}
                </Text>

                <Text style={styles.modalText}>
                  {t('login.termsContent.paragraph1')}
                </Text>

                <Text style={styles.modalText}>
                  {t('login.termsContent.paragraph2')}
                </Text>
              </ScrollView>

              <Button
                label={t('common.close')}
                onPress={() => setModalVisible(false)}
              />
            </View>
          </View>
        </Modal>

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
            color={colors.secondary}
          />

          <Text style={styles.googleText}>
            {t('login.googleLoginButton')}
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

  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
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
