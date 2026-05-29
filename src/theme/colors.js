// EventSpace — Design System v3 "Premium Venue" (violet-prune + or chaud)

export const lightColors = {
  bg: '#FAFAF8',
  white: '#FFFFFF',
  card: '#FFFFFF',
  dark: '#1C1917',
  mid: '#78716C',
  light: '#A8A29E',
  muted: '#78716C',
  text: '#1C1917',
  primary: '#6D28D9',
  primaryLight: '#EDE9FE',
  secondary: '#D97706',
  secondaryLight: '#FEF3C7',
  warning: '#D97706',
  success: '#059669',
  error: '#DC2626',
  border: '#DDD9D3',
  borderLight: '#F0EDE8',
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F4F1',
};

export const darkColors = {
  bg: '#1C1917',
  white: '#292524',
  card: '#292524',
  dark: '#FAFAF8',
  mid: '#A8A29E',
  light: '#78716C',
  muted: '#A8A29E',
  text: '#FAFAF8',
  primary: '#A78BFA',
  primaryLight: '#4C1D95',
  secondary: '#FBBF24',
  secondaryLight: '#78350F',
  warning: '#FBBF24',
  success: '#34D399',
  error: '#F87171',
  border: '#44403C',
  borderLight: '#292524',
  surface: '#292524',
  surfaceSecondary: '#1C1917',
};

/** @deprecated Utiliser useTheme().colors — conservé pour compatibilité */
export const colors = lightColors;

export const COLORS = {
  primary: lightColors.primary,
  primaryDark: '#4C1D95',
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
  shadow: 'rgba(109,40,217,0.12)',
};

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48,
};

export const typography = {
  tiny: 11, small: 13, body: 15, h3: 17, h2: 19, h1: 24, display: 32,
  sm: 13, base: 15, lg: 17, xl: 22,
};

export const radius = {
  xs: 6, sm: 10, md: 14, lg: 18, xl: 24, xxl: 32, full: 9999,
};

export const shadow = {
  xs: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  md: { shadowColor: '#6D28D9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12, elevation: 4 },
  lg: { shadowColor: '#6D28D9', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 8 },
};
