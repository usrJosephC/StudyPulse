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
import { NameInput } from './NameInput';
import { ConfirmPasswordInput } from './ConfirmPasswordInput';
import { BirthDateInput } from './BirthDateInput';
import { GenderInput } from './GenderInput';

import { fonts, radius, spacing } from '../theme';

import {
  signUpSchema,
  type RegisterFormData,
} from '../validation/schemas';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { logSafeError } from '../lib/logger';
import { useErrorShake } from '../hooks/useErrorShake';

type Props = {
  onRegisterSuccess?: () => void;
};

export function Register({ onRegisterSuccess }: Props) {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const { temaAtual } = useTheme();
  const { shake, shakeStyle } = useErrorShake();

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const submitInProgress = useRef(false);

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      gap: spacing.md,
    },

    sectionTitle: {
      fontFamily: fonts.bodyBold,
      fontSize: 14,
      color: temaAtual.ink,
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
      color: temaAtual.inkMuted,
      lineHeight: 17,
    },

    termsLink: {
      fontFamily: fonts.bodyBold,
      color: temaAtual.secondary,
      textDecorationLine: 'underline',
    },

    termsError: {
      fontFamily: fonts.bodyMedium,
      fontSize: 12,
      color: temaAtual.danger,
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
      backgroundColor: temaAtual.card,
      borderRadius: radius.lg,
      padding: spacing.xl,
      gap: spacing.lg,
    },

    modalTitle: {
      fontFamily: fonts.headlineBold,
      fontSize: 20,
      color: temaAtual.ink,
      marginBottom: spacing.sm,
    },

    modalText: {
      fontFamily: fonts.bodyRegular,
      fontSize: 14,
      lineHeight: 21,
      color: temaAtual.inkMuted,
      marginBottom: spacing.md,
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData, unknown, RegisterFormData>({
    resolver: yupResolver(signUpSchema(t)),
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
      shake(t('register.longNameMessage'));
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
        shake(result.error.message || t('register.unexpectedError'));
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
      onRegisterSuccess?.();
    } catch {
      logSafeError('auth.registration_failed');
      shake(t('register.unexpectedError'));

      Alert.alert(
        t('common.error'),
        t('register.unexpectedError')
      );
    } finally {
      submitInProgress.current = false;
      setIsLoading(false);
    }
  }

  function handleRegister() {
    if (!acceptedTerms) {
      setTermsError(true);
      shake(t('login.acceptTermsRequired'));
      return;
    }

    setTermsError(false);
    void handleSubmit(onSubmit, () => {
      shake(t('common.formInvalid'));
    })();
  }

  function handleTermsToggle() {
    setAcceptedTerms((current) => !current);
    setTermsError(false);
  }

  return (
    <Animated.View style={[styles.container, shakeStyle]}>
      <NameInput control={control} errors={errors} />

      <EmailInput control={control} errors={errors} />

      <PasswordInput control={control} errors={errors} />

      <ConfirmPasswordInput
        control={control}
        errors={errors}
      />

      <Text style={styles.sectionTitle}>
        {t('register.birthDate')}
      </Text>

      <BirthDateInput control={control} errors={errors} />

      <Text style={styles.sectionTitle}>
        {t('register.gender')}
      </Text>

      <GenderInput control={control} errors={errors} />

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
            name={acceptedTerms ? 'checkbox' : 'square-outline'}
            size={18}
            color={
              termsError
                ? temaAtual.danger
                : temaAtual.secondary
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
            <ScrollView showsVerticalScrollIndicator={false}>
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

      {/* Register button */}
      <Button
        label={
          isLoading
            ? t('register.creatingAccount')
            : t('register.createAccountButton')
        }
        onPress={handleRegister}
        disabled={isLoading}
      />
    </Animated.View>
  );
}
