import { StyleSheet, View, type ViewProps } from 'react-native';
import { radius, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

export function Card({ style, ...rest }: ViewProps) {
  const { temaAtual } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: temaAtual.card,
      borderRadius: radius.lg,
      padding: spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
  });

  return <View style={[styles.card, style]} {...rest} />;
}
