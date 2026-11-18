import { useMotion } from '../contexts/MotionContext';

export function useReducedMotion() {
  return useMotion().reduceMotion;
}
