import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { ReactNode } from 'react';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children?: ReactNode;
};

export function ProgressRing({
  progress,
  size = 160,
  strokeWidth = 14,
  color,
  trackColor,
  children,
}: Props) {
  const { temaAtual } = useTheme();

  const radiusPx = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusPx;
  const clamped = Math.max(0, Math.min(1, progress));
  const dashOffset = circumference * (1 - clamped);

  const ringColor = color ?? temaAtual.primary;
  const backgroundColor = trackColor ?? temaAtual.surface;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusPx}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusPx}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={StyleSheet.absoluteFill}>
        <View style={styles.center}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
