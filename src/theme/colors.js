/**
 * EventSpace — Design System v3
 *
 * SOURCE OF TRUTH for colors, spacing, typography, radius, shadows.
 * All exported objects are stable: no key returns `undefined`.
 *
 * Palette: Indigo + Pink accents on light surfaces — modern, friendly, trustable.
 */

// ─── Brand palette ───────────────────────────────────────────────────────────
const palette = {
  indigo50:  '#EEF2FF',
  indigo100: '#E0E7FF',
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  indigo700: '#4338CA',
  pink50:    '#FCE7F3',
  pink500:   '#EC4899',
  emerald50: '#ECFDF5',
  emerald500:'#10B981',
  emerald600:'#059669',
  amber50:   '#FEF3C7',
  amber500:  '#F59E0B',
  amber600:  '#D97706',
  red50:     '#FEE2E2',
  red500:    '#EF4444',
  red600:    '#DC2626',
  slate50:   '#F8FAFC',
  slate100:  '#F1F5F9',
  slate200:  '#E2E8F0',
  slate300:  '#CBD5E1',
  slate400:  '#94A3B8',
  slate500:  '#64748B',
  slate700:  '#334155',
  slate900:  '#0F172A',
  white:     '#FFFFFF',
  black:     '#000000',
};

// ─── Semantic colors ─────────────────────────────────────────────────────────
export const colors = {
  primary:        palette.indigo600,
  primaryDark:    palette.indigo700,
  primaryLight:   palette.indigo50,
  primarySoft:    palette.indigo100,
  secondary:      palette.pink500,
  secondaryLight: palette.pink50,

  success:      palette.emerald500,
  successDark:  palette.emerald600,
  successLight: palette.emerald50,

  warning:      palette.amber500,
  warningDark:  palette.amber600,
  warningLight: palette.amber50,

  error:        palette.red500,
  errorDark:    palette.red600,
  errorLight:   palette.red50,

  bg:           palette.slate50,
  background:   palette.slate50,
  surface:      palette.white,
  surfaceAlt:   palette.slate100,
  white:        palette.white,
  card:         palette.white,

  // Text
  text:          palette.slate900,
  textSecondary: palette.slate500,
  textLight:     palette.slate400,
  dark:          palette.slate900,
  mid:           palette.slate500,
  muted:         palette.slate500,
  light:         palette.slate400,

  // Borders / dividers
  border:      palette.slate200,
  borderLight: palette.slate100,
  borderDark:  palette.slate300,

  // Misc
  black:       palette.black,
  shadow:      'rgba(15,23,42,0.10)',
  overlay:     'rgba(15,23,42,0.45)',
};

// Backwards-compat alias used by older screens
export const COLORS = colors;

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
  xxxl:48,
};

// ─── Typography ──────────────────────────────────────────────────────────────
// Numbers (compatible with how StyleSheets read them as fontSize)
export const typography = {
  tiny:    11,
  small:   13,
  body:    15,
  base:    15,
  bodyLg:  16,
  h3:      17,
  lg:      18,
  h2:      20,
  xl:      22,
  h1:      24,
  display: 30,
  hero:    34,
};

// ─── Radius ──────────────────────────────────────────────────────────────────
export const radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  full: 9999,
};

// ─── Shadows ─────────────────────────────────────────────────────────────────
export const shadow = {
  none: {},
  xs: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: palette.indigo600,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  primary: {
    shadowColor: palette.indigo600,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 6,
  },
};

// ─── Gradients ───────────────────────────────────────────────────────────────
// LinearGradient `colors` arrays — keep them simple for cross-platform parity.
export const gradients = {
  primary:   ['#6366F1', '#4F46E5'],
  primaryHi: ['#818CF8', '#4F46E5'],
  pink:      ['#F472B6', '#EC4899'],
  hero:      ['#4F46E5', '#7C3AED', '#EC4899'],
  success:   ['#34D399', '#10B981'],
  warm:      ['#FBBF24', '#F59E0B'],
  cool:      ['#60A5FA', '#3B82F6'],
};
