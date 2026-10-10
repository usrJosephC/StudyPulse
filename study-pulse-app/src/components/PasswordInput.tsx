import { useState } from 'react';

import {
  Controller,
  Control,
  FieldErrors,
  FieldValues,
  Path,
} from 'react-hook-form';

import { Ionicons } from '@expo/vector-icons';

import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  colors,
  fonts,
  radius,
  spacing,
} from '../theme';

type Props<T extends FieldValues> = {
  control: Control<T>;
  errors: FieldErrors<T>;
};

export function PasswordInput<T extends FieldValues>({
  control,
  errors,
}: Props<T>) {
  const [showPassword, setShowPassword] =
    useState(false);

  return (
    <Controller
      control={control}
      name={'password' as Path<T>}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={styles.wrapper}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.inkMuted}
              style={styles.icon}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.inkFaint}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable
              onPress={() =>
                setShowPassword(
                  (current) => !current
                )
              }
              hitSlop={8}
            >
              <Ionicons
                name={
                  showPassword
                    ? 'eye-outline'
                    : 'eye-off-outline'
                }
                size={20}
                color={colors.inkMuted}
              />
            </Pressable>
          </View>

          {errors.password && (
            <Text style={styles.error}>
              {String(errors.password.message)}
            </Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
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
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.ink,
  },

  error: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.xs,
    marginLeft: spacing.lg,
  },
});