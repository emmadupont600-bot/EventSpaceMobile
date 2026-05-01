// EventSpace — Design System v3
// Palette indigo premium, surfaces propres, tokens enrichis

export const COLORS = {
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primaryMedium: '#6366F1',
  primaryLight: '#EEF2FF',
  primaryBorder: '#C7D2FE',
  secondary: '#EC4899',
  secondaryLight: '#FCE7F3',
  accent: '#10B981',
  background: '#F8F9FF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  text: '#0F172A',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(15,23,42,0.5)',
  shadow: 'rgba(79,70,229,0.12)',
};

export const colors = {
  bg: '#F8F9FF',
  white: '#FFFFFF',
  card: '#FFFFFF',
  dark: '#0F172A',
  mid: '#64748B',
  light: '#94A3B8',
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primaryMedium: '#6366F1',
  primaryLight: '#EEF2FF',
  primaryBorder: '#C7D2FE',
  secondary: '#EC4899',
  secondaryLight: '#FCE7F3',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  overlay: 'rgba(15,23,42,0.5)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const typography = {
  tiny: 11,
  small: 13,
  body: 15,
  h3: 17,
  h2: 20,
  h1: 24,
  display: 30,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

export const shadow = {
  xs: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  colored: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  }),
};
