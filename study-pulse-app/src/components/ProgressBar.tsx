import { StyleSheet, View } from 'react-native';
import { radius } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
};

export function ProgressBar({
  progress,
  color,
  trackColor,
  height = 8,
}: Props) {
  const { temaAtual } = useTheme();

  const clamped = Math.max(0, Math.min(1, progress));
  const fillColor = color ?? temaAtual.primary;
  const backgroundColor = trackColor ?? temaAtual.surface;

  return (
    <View
      style={[
        styles.track,
        {
          backgroundColor,
          height,
        },
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            backgroundColor: fillColor,
            width: `${clamped * 100}%`,
            height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: radius.pill,
  },
});
