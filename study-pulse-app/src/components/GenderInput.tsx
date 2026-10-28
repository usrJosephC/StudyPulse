import {
  Controller,
  type Control,
  type FieldErrors,
} from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { fonts, radius, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import type { RegisterFormData } from '../validation/schemas';

type Props = {
  control: Control<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
};

export function GenderInput({ control, errors }: Props) {
  const { t } = useTranslation();
  const { temaAtual } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    option: {
      flex: 1,
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: temaAtual.border,
      borderRadius: radius.sm,
      backgroundColor: temaAtual.card,
    },
    optionSelected: {
      borderColor: temaAtual.secondary,
      backgroundColor: temaAtual.secondarySoft,
    },
    label: {
      fontFamily: fonts.bodyMedium,
      fontSize: 14,
      color: temaAtual.inkFaint,
    },
    labelSelected: {
      fontFamily: fonts.bodyBold,
      color: temaAtual.secondary,
    },
    circle: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: temaAtual.inkFaint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circleSelected: {
      borderColor: temaAtual.secondary,
      backgroundColor: temaAtual.secondary,
    },
    error: {
      marginTop: spacing.xs,
      marginLeft: spacing.sm,
      fontFamily: fonts.bodyRegular,
      fontSize: 12,
      color: temaAtual.danger,
    },
  });

  const options = [
    {
      label: t('register.genderOptions.female'),
      value: 'F',
    },
    {
      label: t('register.genderOptions.male'),
      value: 'M',
    },
    {
      label: t('register.genderOptions.other'),
      value: 'Other',
    },
  ];

  return (
    <Controller
      control={control}
      name="gender"
      render={({ field: { value, onChange } }) => (
        <View style={styles.container}>
          <View style={styles.row}>
            {options.map((option) => {
              const selected = value === option.value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => onChange(option.value)}
                  style={[
                    styles.option,
                    selected && styles.optionSelected,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.label,
                      selected && styles.labelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>

                  <View
                    style={[
                      styles.circle,
                      selected && styles.circleSelected,
                    ]}
                  >
                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={temaAtual.card}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {errors.gender && (
            <Text style={styles.error}>
              {String(errors.gender.message)}
            </Text>
          )}
        </View>
      )}
    />
  );
}
