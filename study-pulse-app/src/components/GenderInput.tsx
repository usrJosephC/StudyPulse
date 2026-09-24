import {
  Controller,
  Control,
  FieldErrors,
} from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  colors,
  fonts,
  radius,
  spacing,
} from '../theme';

import type { RegisterFormData } from '../validation/schemas';

type Props = {
  control: Control<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
};

const options = [
  {
    label: 'Female',
    value: 'F',
  },
  {
    label: 'Male',
    value: 'M',
  },
  {
    label: 'Other',
    value: 'Other',
  },
];

export function GenderInput({
  control,
  errors,
}: Props) {
  return (
    <Controller
      control={control}
      name="gender"
      render={({ field: { value, onChange } }) => (
        <View style={styles.container}>
          <View style={styles.row}>
            {options.map((option) => {
              const selected =
                value === option.value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() =>
                    onChange(option.value)
                  }
                  style={[
                    styles.option,
                    selected &&
                      styles.optionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.label,
                      selected &&
                        styles.labelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>

                  <View
                    style={[
                      styles.circle,
                      selected &&
                        styles.circleSelected,
                    ]}
                  >
                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={colors.card}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {errors.gender && (
            <Text style={styles.error}>
              {errors.gender.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}

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
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
  },

  optionSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondarySoft,
  },

  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.inkMuted,
  },

  labelSelected: {
    fontFamily: fonts.bodyBold,
    color: colors.secondary,
  },

  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.inkFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },

  circleSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondary,
  },

  error: {
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.danger,
  },
});