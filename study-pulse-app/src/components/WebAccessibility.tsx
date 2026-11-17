import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

/** Keyboard focus must remain visible on RN Web controls, including modal actions. */
export function WebAccessibility() {
  const { temaAtual } = useTheme();
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.dataset.studyPulse = 'keyboard-focus';
    style.textContent = `
      :is(button, a, input, select, textarea, [role="button"], [role="checkbox"], [role="radio"], [role="tab"], [tabindex]):focus {
        outline: 3px solid ${temaAtual.secondary} !important;
        outline-offset: 3px !important;
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, [temaAtual.secondary]);
  return null;
}
