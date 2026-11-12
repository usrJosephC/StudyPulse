import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { fonts, radius, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import type { RegisterFormData } from '../validation/schemas';

type Props = {
  control: Control<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
};

export function NameInput({ control, errors }: Props) {
  const { t } = useTranslation();
  const { temaAtual } = useTheme();

  const styles = StyleSheet.create({
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
      marginTop: spacing.xs,
      marginLeft: spacing.sm,
      fontFamily: fonts.bodyRegular,
      fontSize: 12,
      color: temaAtual.danger,
    },
  });

  return (
    <Controller
      control={control}
      name="name"
      render={({ field: { onChange, onBlur, value } }) => (
        <View>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color={temaAtual.inkMuted}
              style={styles.icon}
            />

            <TextInput
              style={styles.input}
              placeholder={t('register.name')}
              placeholderTextColor={temaAtual.inkFaint}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {errors.name && (
            <Text style={styles.error}>
              {String(errors.name.message)}
            </Text>
          )}
        </View>
      )}
    />
  );
}
