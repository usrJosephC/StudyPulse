import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, radius, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

export type ButtonVariant = 'primary' | 'outline' | 'muted';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
}: Props) {
  const { temaAtual } = useTheme();
  const [focused, setFocused] = useState(false);

  const styles = StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: 14,
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    pressed: {
      opacity: 0.85,
    },
    focused: {
      borderColor: temaAtual.secondary,
    },
    label: {
      fontFamily: fonts.bodyBold,
      fontSize: 15,
    },
  });

  const variantStyles: Record<
    ButtonVariant,
    { container: object; label: { color: string } }
  > = {
    primary: {
      container: {
        backgroundColor: temaAtual.primary,
      },
      label: {
        color: '#212121',
      },
    },
    outline: {
      container: {
        borderWidth: 1.5,
        borderColor: temaAtual.secondary,
        backgroundColor: 'transparent',
      },
      label: {
        color: temaAtual.secondary,
      },
    },
    muted: {
      container: {
        backgroundColor: temaAtual.surface,
      },
      label: {
        color: temaAtual.ink,
      },
    },
  };

  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant].container,
        pressed && styles.pressed,
        focused && styles.focused,
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text style={[styles.label, variantStyles[variant].label]}>
        {label}
      </Text>

      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={variantStyles[variant].label.color}
        />
      )}
    </Pressable>
  );
}
