import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, spacing, typography, radius, shadow } from '../theme/colors';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const value = useMemo(() => ({
    isDark,
    colors: isDark ? darkColors : lightColors,
    spacing,
    typography,
    radius,
    shadow,
  }), [isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      isDark: false,
      colors: lightColors,
      spacing,
      typography,
      radius,
      shadow,
    };
  }
  return ctx;
}

/** Compat rétro : screens qui importent colors depuis theme/colors.js */
export function useThemedColors() {
  return useTheme().colors;
}
