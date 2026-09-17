import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme';

export type PillVariant = 'primary' | 'secondary' | 'outline' | 'muted';

type Props = {
  label: string;
  variant?: PillVariant;
  icon?: React.ReactNode;
};

export function Pill({ label, variant = 'muted', icon }: Props) {
  return (
    <View style={[styles.base, variantStyles[variant].container]}>
      {icon}
      <Text style={[styles.label, variantStyles[variant].label]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
});

const variantStyles: Record<PillVariant, { container: object; label: object }> = {
  primary: {
    container: { backgroundColor: colors.primary },
    label: { color: colors.ink },
  },
  secondary: {
    container: { backgroundColor: colors.secondary },
    label: { color: '#FFFFFF' },
  },
  outline: {
    container: { borderWidth: 1, borderColor: colors.secondary },
    label: { color: colors.secondary },
  },
  muted: {
    container: { backgroundColor: colors.surface },
    label: { color: colors.inkMuted },
  },
};
