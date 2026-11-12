import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { radius } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { useReducedMotion } from '../hooks/useReducedMotion';

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
  const reduceMotion = useReducedMotion();

  const clamped = Math.max(0, Math.min(1, progress));
  const [animatedProgress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    animatedProgress.stopAnimation();
    if (reduceMotion) {
      animatedProgress.setValue(clamped);
      return;
    }

    const animation = Animated.timing(animatedProgress, {
      toValue: clamped,
      duration: 300,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [animatedProgress, clamped, reduceMotion]);

  const fillColor = color ?? temaAtual.primary;
  const backgroundColor = trackColor ?? temaAtual.surface;
  const fillWidth = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

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
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: fillColor,
            width: fillWidth,
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
