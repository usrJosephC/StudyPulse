import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: {
    day: number | null;
    month: number | null;
    year: number | null;
  };
  gender: string;
};

type Props = {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
};

export function NameInput({ control, errors }: Props) {
  return (
    <Controller
      control={control}
      name="name"
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={styles.wrapper}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color={colors.inkMuted}
              style={styles.icon}
            />

            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor={colors.inkFaint}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {errors.name && (
            <Text style={styles.error}>
              {errors.name.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    height: 48,
  },

  icon: {
    marginRight: spacing.sm,
  },

  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: colors.ink,
  },

  error: {
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.danger,
  },
});