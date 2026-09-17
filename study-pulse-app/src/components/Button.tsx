import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../theme';

export type ButtonVariant = 'primary' | 'outline' | 'muted';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function Button({ label, onPress, variant = 'primary', icon }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.base, variantStyles[variant].container, pressed && styles.pressed]}
    >
      <Text style={[styles.label, variantStyles[variant].label]}>{label}</Text>
      {icon && <Ionicons name={icon} size={18} color={variantStyles[variant].label.color as string} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radius.pill,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
});

const variantStyles: Record<ButtonVariant, { container: object; label: { color: string } }> = {
  primary: {
    container: { backgroundColor: colors.primary },
    label: { color: colors.ink },
  },
  outline: {
    container: { borderWidth: 1.5, borderColor: colors.secondary, backgroundColor: 'transparent' },
    label: { color: colors.secondary },
  },
  muted: {
    container: { backgroundColor: colors.surface },
    label: { color: colors.ink },
  },
};
