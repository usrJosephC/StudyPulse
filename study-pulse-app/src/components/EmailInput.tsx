import {
  Controller,
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { fonts, radius, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

type Props<T extends FieldValues> = {
  control: Control<T>;
  errors: FieldErrors<T>;
};

export function EmailInput<T extends FieldValues>({
  control,
  errors,
}: Props<T>) {
  const { t } = useTranslation();
  const { temaAtual } = useTheme();

  const styles = StyleSheet.create({
    wrapper: {
      width: '100%',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: temaAtual.surface,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.lg,
      height: 48,
    },
    icon: {
      marginRight: spacing.sm,
    },
    input: {
      flex: 1,
      fontFamily: fonts.bodyRegular,
      fontSize: 14,
      color: temaAtual.ink,
    },
    error: {
      fontFamily: fonts.bodyMedium,
      fontSize: 12,
      color: temaAtual.danger,
      marginTop: spacing.xs,
      marginLeft: spacing.lg,
    },
  });

  return (
    <Controller
      control={control}
      name={'email' as Path<T>}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={styles.wrapper}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={temaAtual.inkMuted}
              style={styles.icon}
            />

            <TextInput
              style={styles.input}
              placeholder={t('login.email')}
              placeholderTextColor={temaAtual.inkFaint}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {errors.email && (
            <Text style={styles.error}>
              {String(errors.email.message)}
            </Text>
          )}
        </View>
      )}
    />
  );
}
