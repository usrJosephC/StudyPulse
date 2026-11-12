import { useState } from 'react';
import {
  Controller,
  type Control,
  type FieldErrors,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import {
  FlatList,
  Modal,
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

type PickerType = 'day' | 'month' | 'year' | null;

const days = Array.from({ length: 31 }, (_, index) => index + 1);
const months = Array.from({ length: 12 }, (_, index) => index + 1);
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, index) => currentYear - index);

export function BirthDateInput({ control, errors }: Props) {
  const { t } = useTranslation();
  const { temaAtual } = useTheme();
  const [pickerType, setPickerType] = useState<PickerType>(null);

  const fieldLabels = {
    day: t('register.birthDateFields.day'),
    month: t('register.birthDateFields.month'),
    year: t('register.birthDateFields.year'),
  };

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    field: {
      flex: 1,
      height: 50,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: temaAtual.border,
      borderRadius: radius.sm,
      backgroundColor: temaAtual.card,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    fieldPressed: {
      opacity: 0.7,
    },
    fieldText: {
      fontFamily: fonts.bodyRegular,
      fontSize: 15,
      color: temaAtual.ink,
    },
    placeholder: {
      color: temaAtual.inkFaint,
    },
    error: {
      marginTop: spacing.xs,
      marginLeft: spacing.sm,
      fontFamily: fonts.bodyRegular,
      fontSize: 12,
      color: temaAtual.danger,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    modal: {
      width: '100%',
      maxWidth: 360,
      height: 480,
      backgroundColor: temaAtual.card,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    modalTitle: {
      marginBottom: spacing.md,
      fontFamily: fonts.headlineBold,
      fontSize: 18,
      color: temaAtual.ink,
      textAlign: 'center',
    },
    listContent: {
      paddingBottom: spacing.sm,
    },
    option: {
      minHeight: 46,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    optionPressed: {
      backgroundColor: temaAtual.primaryMuted,
    },
    optionText: {
      fontFamily: fonts.bodyMedium,
      fontSize: 14,
      color: temaAtual.ink,
    },
  });

  return (
    <Controller
      control={control}
      name="birthDate"
      render={({ field: { value, onChange } }) => {
        const options =
          pickerType === 'day'
            ? days
            : pickerType === 'month'
              ? months
              : years;

        function handleChange(
          key: keyof RegisterFormData['birthDate'],
          selectedValue: number
        ) {
          onChange({
            ...value,
            [key]: selectedValue,
          });
          setPickerType(null);
        }

        function getValue(
          type: keyof RegisterFormData['birthDate']
        ) {
          const selectedValue = value?.[type];

          if (
            selectedValue === null ||
            selectedValue === undefined
          ) {
            return fieldLabels[type];
          }

          return String(selectedValue);
        }

        return (
          <View style={styles.container}>
            <View style={styles.row}>
              {(['day', 'month', 'year'] as const).map((type) => {
                const hasValue =
                  value?.[type] !== null &&
                  value?.[type] !== undefined;

                return (
                  <Pressable
                    key={type}
                    accessibilityRole="button"
                    accessibilityLabel={fieldLabels[type]}
                    onPress={() => setPickerType(type)}
                    style={({ pressed }) => [
                      styles.field,
                      pressed && styles.fieldPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.fieldText,
                        !hasValue && styles.placeholder,
                      ]}
                    >
                      {getValue(type)}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={18}
                      color={temaAtual.inkMuted}
                    />
                  </Pressable>
                );
              })}
            </View>

            {(errors.birthDate?.day ||
              errors.birthDate?.month ||
              errors.birthDate?.year) && (
              <Text
                accessibilityRole="alert"
                style={styles.error}
              >
                {t('register.birthDateError')}
              </Text>
            )}

            <Modal
              visible={pickerType !== null}
              transparent
              animationType="fade"
              onRequestClose={() => setPickerType(null)}
            >
              <View style={styles.overlay}>
                <Pressable
                  style={StyleSheet.absoluteFill}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.close')}
                  onPress={() => setPickerType(null)}
                />

                <View style={styles.modal}>
                  <Text style={styles.modalTitle}>
                    {t('register.birthDateSelect', {
                      field: pickerType
                        ? fieldLabels[pickerType]
                        : '',
                    })}
                  </Text>

                  <FlatList
                    data={options}
                    keyExtractor={(item) => String(item)}
                    showsVerticalScrollIndicator
                    persistentScrollbar
                    nestedScrollEnabled
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                          if (pickerType) {
                            handleChange(pickerType, item);
                          }
                        }}
                        style={({ pressed }) => [
                          styles.option,
                          pressed && styles.optionPressed,
                        ]}
                      >
                        <Text style={styles.optionText}>
                          {item}
                        </Text>
                      </Pressable>
                    )}
                  />
                </View>
              </View>
            </Modal>
          </View>
        );
      }}
    />
  );
}
