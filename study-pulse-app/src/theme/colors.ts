// StudyPulse v2 palette — see design/StudyPulse_Palette_v2.png

export const lightColors = {
  primary: '#F5CC00',
  primarySoft: '#FCEE9E',
  primaryMuted: '#FDF6D3',

  secondary: '#003566',
  secondarySoft: '#D6E4F0',

  background: '#FAFAFA',
  surface: '#EBEBEB',
  card: '#FFFFFF',

  ink: '#212121',
  inkMuted: '#6B7280',
  inkFaint: '#9CA3AF',

  border: '#E5E5E5',
  danger: '#C1121F',
};

export const darkColors = {
  primary: '#F5CC00',
  primarySoft: '#665800',
  primaryMuted: '#393200',

  secondary: '#8AB4E0',
  secondarySoft: '#203A52',

  background: '#121212',
  surface: '#1E1E1E',
  card: '#252525',

  ink: '#F5F5F5',
  inkMuted: '#B0B7C3',
  inkFaint: '#858D99',

  border: '#383838',
  danger: '#FF6B6B',
};

export const colors = lightColors;

export type Colors = typeof lightColors;

export type ThemeName = 'light' | 'dark';

export const themes: Record<ThemeName, Colors> = {
  light: lightColors,
  dark: darkColors,
};
