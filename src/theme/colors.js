/**
 * colors.js — alias rétrocompatible du Design System v4 "Luxury Minimal".
 *
 * ⚠️ Source de vérité : src/theme/tokens.ts
 * Les écrans migrés doivent utiliser useTheme() (mode sombre) ou tokens.ts.
 * Ce fichier conserve l'ancienne API (lightColors, COLORS, colors, spacing,
 * typography numérique, radius, shadow) pour les écrans non migrés.
 */
import {
  colors as tokenColors,
  spacing as tokenSpacing,
  radius as tokenRadius,
  shadow as tokenShadow,
} from './tokens';

function legacyFromSemantic(c) {
  return {
    bg: c.bg,
    white: c.surface,
    card: c.surface,
    dark: c.text,
    mid: c.textMuted,
    light: c.textFaint,
    muted: c.textMuted,
    text: c.text,
    primary: c.primary,
    primaryLight: c.primarySoft,
    secondary: c.gold,
    secondaryLight: c.goldSoft,
    warning: c.warning,
    success: c.success,
    error: c.error,
    border: c.border,
    borderLight: c.borderSubtle,
    surface: c.surface,
    surfaceSecondary: c.bg,
  };
}

export const lightColors = legacyFromSemantic(tokenColors.light);
export const darkColors = legacyFromSemantic(tokenColors.dark);

/** @deprecated Utiliser useTheme().colors — conservé pour compatibilité */
export const colors = lightColors;

/** @deprecated Utiliser useTheme().colors ou tokens.ts — conservé pour compatibilité */
export const COLORS = {
  primary: lightColors.primary,
  primaryDark: '#9D5536',
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
  shadow: 'rgba(74,58,42,0.12)',
};

export const spacing = tokenSpacing;

/** Tailles numériques legacy — minimum absolu 12px (accessibilité) */
export const typography = {
  tiny: 12, small: 13, body: 15, h3: 17, h2: 19, h1: 24, display: 32,
  sm: 13, base: 15, lg: 17, xl: 22,
};

export const radius = tokenRadius;

export const shadow = tokenShadow;
