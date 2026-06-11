import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, spacing, typography, radius, shadow } from '../theme/colors';
import {
  colors as semanticColors,
  typography as typeStyles,
  fontFamily,
  animation,
} from '../theme/tokens';

const ThemeContext = createContext(null);

function buildTheme(isDark) {
  return {
    isDark,
    /** Forme legacy (bg, dark, mid, light, primaryLight, ...) — compat écrans non migrés */
    colors: isDark ? darkColors : lightColors,
    /** Tokens sémantiques v4 (bg, surface, surfaceElevated, text, textMuted, primary, gold, ...) */
    semantic: isDark ? semanticColors.dark : semanticColors.light,
    spacing,
    /** Tailles numériques legacy */
    typography,
    /** Styles texte complets (fontFamily, lineHeight, letterSpacing) */
    type: typeStyles,
    fontFamily,
    radius,
    shadow,
    animation,
  };
}

export function ThemeProvider({ children }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const value = useMemo(() => buildTheme(isDark), [isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return buildTheme(false);
  return ctx;
}

/** Compat rétro : screens qui importent colors depuis theme/colors.js */
export function useThemedColors() {
  return useTheme().colors;
}
