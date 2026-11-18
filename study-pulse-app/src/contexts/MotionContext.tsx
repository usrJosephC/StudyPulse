import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AccessibilityInfo } from 'react-native';

const REDUCE_MOTION_KEY = '@study-pulse/reduce-motion';

type MotionContextValue = {
  reduceMotion: boolean;
  systemReduceMotion: boolean;
  userReduceMotion: boolean;
  setUserReduceMotion: (enabled: boolean) => Promise<void>;
};

const MotionContext = createContext<MotionContextValue | null>(null);

export function MotionProvider({ children }: { children: ReactNode }) {
  // Start conservatively: no motion is played before both preferences are known.
  const [systemReduceMotion, setSystemReduceMotion] = useState(true);
  const [userReduceMotion, setUserReduceMotionState] = useState(false);

  useEffect(() => {
    let mounted = true;

    void Promise.all([
      AccessibilityInfo.isReduceMotionEnabled().catch(() => true),
      AsyncStorage.getItem(REDUCE_MOTION_KEY).catch(() => null),
    ]).then(([systemEnabled, storedPreference]) => {
      if (!mounted) return;
      setSystemReduceMotion(systemEnabled);
      setUserReduceMotionState(storedPreference === 'true');
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setSystemReduceMotion,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const setUserReduceMotion = useCallback(async (enabled: boolean) => {
    setUserReduceMotionState(enabled);
    try {
      await AsyncStorage.setItem(REDUCE_MOTION_KEY, String(enabled));
    } catch {
      // Keep the preference active for the current session even if storage fails.
    }
  }, []);

  const value = useMemo<MotionContextValue>(() => ({
    reduceMotion: systemReduceMotion || userReduceMotion,
    systemReduceMotion,
    userReduceMotion,
    setUserReduceMotion,
  }), [setUserReduceMotion, systemReduceMotion, userReduceMotion]);

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotion() {
  const value = useContext(MotionContext);
  if (!value) throw new Error('useMotion must be used within MotionProvider');
  return value;
}
