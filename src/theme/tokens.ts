/**
 * EventSpace — Design System v4 "Luxury Minimal" (2026)
 *
 * Direction artistique : base neutre chaude (off-white / charcoal profond),
 * accent terracotta unique (jamais de gradient sur les boutons),
 * or discret réservé aux badges premium et aux étoiles de notation,
 * ombres ton-sur-ton chaudes (pas de borders grises dures).
 *
 * Source de vérité unique. `colors.js` et `typography.js` ré-exportent
 * ces tokens pour la rétrocompatibilité des écrans non migrés.
 */
import { Platform } from 'react-native';

// ─── COULEURS ────────────────────────────────────────────────────────────────

export interface SemanticColors {
  bg: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textMuted: string;
  textFaint: string;
  primary: string;
  primaryForeground: string;
  /** Teinte douce de l'accent pour fonds de chips / sélections */
  primarySoft: string;
  secondary: string;
  border: string;
  borderSubtle: string;
  success: string;
  warning: string;
  error: string;
  gold: string;
  /** Teinte douce de l'or pour fonds de badges premium */
  goldSoft: string;
  overlay: string;
}

export const colors: { light: SemanticColors; dark: SemanticColors } = {
  light: {
    bg: '#F8F6F1',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    text: '#1B1713',
    textMuted: '#6E6359',
    textFaint: '#9C9186',
    primary: '#C4714A',
    primaryForeground: '#FFFFFF',
    primarySoft: '#F4E4DA',
    secondary: '#3D5A4A',
    border: '#E8E2D8',
    borderSubtle: '#F1ECE3',
    success: '#3D7A55',
    warning: '#B07C24',
    error: '#B3402F',
    gold: '#B8962E',
    goldSoft: '#F4ECD6',
    overlay: 'rgba(20, 18, 16, 0.45)',
  },
  dark: {
    bg: '#141210',
    surface: '#1E1B18',
    surfaceElevated: '#272320',
    text: '#F4F0EA',
    textMuted: '#ABA195',
    textFaint: '#7C7367',
    primary: '#D98E66',
    primaryForeground: '#1B1713',
    primarySoft: '#3A2A20',
    secondary: '#86A893',
    border: '#332E29',
    borderSubtle: '#262220',
    success: '#6FBF8E',
    warning: '#D9A845',
    error: '#E07B6A',
    gold: '#CFAE52',
    goldSoft: '#332B16',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

// ─── ESPACEMENT (échelle 4px) ────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 64,
} as const;

// ─── RAYONS ──────────────────────────────────────────────────────────────────

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  /** Compat : utilisé par d'anciens écrans */
  xxl: 32,
  full: 999,
} as const;

// ─── TYPOGRAPHIE ─────────────────────────────────────────────────────────────
// Display : serif élégant pour les noms de lieux et hero headings.
// (DM Serif Display peut être branché via expo-font ; en attendant on
// utilise le serif système pour rester sans dépendance supplémentaire.)
// Corps : sans system (équivalent DM Sans / Inter).
// Taille minimale absolue : 12px (accessibilité iOS/Android).

export const fontFamily = {
  display: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }) as string,
  sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }) as string,
};

type RNFontWeight =
  | 'normal' | 'bold'
  | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

export interface TypeStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: RNFontWeight;
  lineHeight: number;
  letterSpacing: number;
}

export const typography: Record<string, TypeStyle> = {
  display: { fontFamily: fontFamily.display, fontSize: 34, fontWeight: '400', lineHeight: 40, letterSpacing: -0.5 },
  hero:    { fontFamily: fontFamily.display, fontSize: 28, fontWeight: '400', lineHeight: 34, letterSpacing: -0.4 },
  h1:      { fontFamily: fontFamily.display, fontSize: 24, fontWeight: '400', lineHeight: 30, letterSpacing: -0.3 },
  h2:      { fontFamily: fontFamily.sans, fontSize: 20, fontWeight: '700', lineHeight: 26, letterSpacing: -0.2 },
  h3:      { fontFamily: fontFamily.sans, fontSize: 17, fontWeight: '600', lineHeight: 23, letterSpacing: -0.1 },
  body:    { fontFamily: fontFamily.sans, fontSize: 15, fontWeight: '400', lineHeight: 22, letterSpacing: 0 },
  bodyMd:  { fontFamily: fontFamily.sans, fontSize: 15, fontWeight: '500', lineHeight: 22, letterSpacing: 0 },
  small:   { fontFamily: fontFamily.sans, fontSize: 13, fontWeight: '400', lineHeight: 18, letterSpacing: 0 },
  smallMd: { fontFamily: fontFamily.sans, fontSize: 13, fontWeight: '500', lineHeight: 18, letterSpacing: 0 },
  tiny:    { fontFamily: fontFamily.sans, fontSize: 12, fontWeight: '500', lineHeight: 16, letterSpacing: 0.3 },
  label:   { fontFamily: fontFamily.sans, fontSize: 12, fontWeight: '600', lineHeight: 16, letterSpacing: 0.8 },
};

// ─── OMBRES (ton-sur-ton chaudes) ────────────────────────────────────────────
// Brun chaud plutôt que noir pur : se fond dans la base neutre chaude.

const WARM_SHADOW = '#4A3A2A';

export const shadow = {
  xs: {
    shadowColor: WARM_SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: WARM_SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: WARM_SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 4,
  },
  lg: {
    shadowColor: WARM_SHADOW,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 26,
    elevation: 8,
  },
} as const;

// ─── ANIMATIONS ──────────────────────────────────────────────────────────────

export const animation = {
  fast: 120,
  base: 200,
  slow: 350,
} as const;

export const tokens = { colors, spacing, radius, typography, fontFamily, shadow, animation };
export default tokens;
