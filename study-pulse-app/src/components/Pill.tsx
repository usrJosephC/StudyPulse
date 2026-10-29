import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { fonts, radius, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

export type PillVariant = 'primary' | 'secondary' | 'outline' | 'muted';

type Props = {
  label: string;
  variant?: PillVariant;
  icon?: ReactNode;
};

export function Pill({ label, variant = 'muted', icon }: Props) {
  const { temaAtual } = useTheme();

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

  const variantStyles: Record<
    PillVariant,
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
    secondary: {
      container: {
        backgroundColor: temaAtual.secondary,
      },
      label: {
        color: '#FFFFFF',
      },
    },
    outline: {
      container: {
        borderWidth: 1,
        borderColor: temaAtual.secondary,
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
        color: temaAtual.inkMuted,
      },
    },
  };

  return (
    <View style={[styles.base, variantStyles[variant].container]}>
      {icon}
      <Text style={[styles.label, variantStyles[variant].label]}>
        {label}
      </Text>
    </View>
  );
}
