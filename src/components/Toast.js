/**
 * Toast.js — Lightweight in-app toast system.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success('Saved!');
 *   toast.error('Something went wrong');
 *   toast.info('Heads up');
 */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, shadow } from '../theme/colors';

const ToastContext = createContext(null);

const VARIANTS = {
  success: { icon: 'checkmark-circle', tint: colors.success,  bg: '#ECFDF5', stroke: '#A7F3D0' },
  error:   { icon: 'alert-circle',     tint: colors.error,    bg: '#FEF2F2', stroke: '#FECACA' },
  info:    { icon: 'information-circle', tint: colors.primary, bg: '#EEF2FF', stroke: '#C7D2FE' },
  warning: { icon: 'warning',          tint: colors.warning,  bg: '#FEF3C7', stroke: '#FDE68A' },
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef(null);

  const show = useCallback((variant, message) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setToast({ variant, message, key: Date.now() });
    Animated.timing(anim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    hideTimer.current = setTimeout(() => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setToast(null));
    }, 2500);
  }, [anim]);

  const api = useRef({
    success: (m) => show('success', m),
    error:   (m) => show('error', m),
    info:    (m) => show('info', m),
    warning: (m) => show('warning', m),
  }).current;

  useEffect(() => () => hideTimer.current && clearTimeout(hideTimer.current), []);

  const variant = toast ? VARIANTS[toast.variant] : null;
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast && variant && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            {
              top: insets.top + 10,
              opacity: anim,
              transform: [{ translateY }],
              backgroundColor: variant.bg,
              borderColor: variant.stroke,
            },
          ]}
        >
          <Ionicons name={variant.icon} size={20} color={variant.tint} />
          <Text style={[styles.text, { color: variant.tint }]} numberOfLines={3}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      success: () => {},
      error:   () => {},
      info:    () => {},
      warning: () => {},
    };
  }
  return ctx;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    zIndex: 9999,
    ...shadow.md,
    ...Platform.select({ android: { elevation: 10 } }),
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
});
