// EventSpace — Design System v2 avec support mode sombre

export const lightColors = {
  bg: '#F8F9FF',
  white: '#FFFFFF',
  card: '#FFFFFF',
  dark: '#0F172A',
  mid: '#64748B',
  light: '#94A3B8',
  muted: '#64748B',
  text: '#0F172A',
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  secondary: '#EC4899',
  secondaryLight: '#FCE7F3',
  warning: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
};

export const darkColors = {
  bg: '#0F172A',
  white: '#1E293B',
  card: '#1E293B',
  dark: '#F8FAFC',
  mid: '#94A3B8',
  light: '#64748B',
  muted: '#94A3B8',
  text: '#F8FAFC',
  primary: '#818CF8',
  primaryLight: '#312E81',
  secondary: '#F472B6',
  secondaryLight: '#831843',
  warning: '#FBBF24',
  success: '#34D399',
  error: '#F87171',
  border: '#334155',
  borderLight: '#1E293B',
  surface: '#1E293B',
  surfaceSecondary: '#0F172A',
};

/** @deprecated Utiliser useTheme().colors — conservé pour compatibilité */
export const colors = lightColors;

export const COLORS = {
  primary: lightColors.primary,
  primaryDark: '#3730A3',
  primaryLight: lightColors.primaryLight,
  secondary: lightColors.secondary,
  secondaryLight: lightColors.secondaryLight,
  accent: lightColors.success,
  background: lightColors.bg,
  surface: lightColors.surface,
  surfaceSecondary: lightColors.surfaceSecondary,
  text: lightColors.text,
  textSecondary: lightColors.mid,
  textLight: lightColors.light,
  border: lightColors.border,
  borderLight: lightColors.borderLight,
  success: lightColors.success,
  warning: lightColors.warning,
  error: lightColors.error,
  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(79,70,229,0.12)',
};

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48,
};

export const typography = {
  tiny: 11, small: 13, body: 15, h3: 17, h2: 20, h1: 24, display: 30,
  sm: 13, base: 15, lg: 17, xl: 22,
};

export const radius = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, full: 9999,
};

export const shadow = {
  xs: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  lg: { shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 8 },
};
