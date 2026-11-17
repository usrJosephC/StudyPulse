import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
import { useReducedMotion } from './useReducedMotion';

export function useErrorShake() {
  const [translateX] = useState(() => new Animated.Value(0));
  const reduceMotion = useReducedMotion();

  useEffect(() => () => {
    translateX.stopAnimation();
  }, [translateX]);

  useEffect(() => {
    if (reduceMotion) {
      translateX.stopAnimation();
      translateX.setValue(0);
    }
  }, [reduceMotion, translateX]);

  const shake = useCallback((announcement?: string) => {
    if (announcement) {
      AccessibilityInfo.announceForAccessibility(announcement);
    }

    translateX.stopAnimation();
    translateX.setValue(0);
    if (reduceMotion) return;

    Animated.sequence([
      Animated.timing(translateX, { toValue: -8, duration: 55, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 8, duration: 70, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: -6, duration: 70, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 6, duration: 70, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 55, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [reduceMotion, translateX]);

  return {
    shake,
    shakeStyle: { transform: [{ translateX }] },
  };
}
