import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, Animated } from 'react-native';

export function useErrorShake() {
  const [translateX] = useState(() => new Animated.Value(0));

  useEffect(() => () => {
    translateX.stopAnimation();
  }, [translateX]);

  const shake = useCallback((announcement?: string) => {
    if (announcement) {
      AccessibilityInfo.announceForAccessibility(announcement);
    }

    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      translateX.stopAnimation();
      translateX.setValue(0);
      if (reduceMotion) return;

      Animated.sequence([
        Animated.timing(translateX, { toValue: -8, duration: 55, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 8, duration: 70, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: -6, duration: 70, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 6, duration: 70, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 0, duration: 55, useNativeDriver: true }),
      ]).start();
    });
  }, [translateX]);

  return {
    shake,
    shakeStyle: { transform: [{ translateX }] },
  };
}
