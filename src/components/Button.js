/**
 * Button — bouton "Luxury Minimal" : couleur d'accent unie (jamais de gradient),
 * state pressed opacité 0.85, loading avec ActivityIndicator inline,
 * tap target minimum 44pt.
 */
import React from 'react';
import { Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import PressableScale from './PressableScale';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  style,
  disabled,
  icon,
  size = 'md',
}) {
  const { semantic } = useTheme();
  const inactive = disabled || loading;
  const isFilled = variant === 'primary' || variant === 'secondary' || variant === 'danger';

  const bg = {
    primary: semantic.primary,
    secondary: semantic.secondary,
    danger: semantic.error,
    outline: 'transparent',
    ghost: semantic.primarySoft,
  }[variant] || semantic.primary;

  const fg = isFilled ? semantic.primaryForeground : semantic.primary;

  const sizeStyle =
    size === 'lg' ? { height: 56, borderRadius: 14 }
    : size === 'sm' ? { height: 44, paddingHorizontal: 16, borderRadius: 12 }
    : { height: 50, borderRadius: 14 };

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      haptic="light"
      scaleTo={0.98}
      accessibilityLabel={title}
      style={[
        styles.btn,
        sizeStyle,
        { backgroundColor: bg },
        variant === 'outline' && { borderWidth: 1, borderColor: semantic.primary },
        inactive && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.inner}>
          {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
          <Text style={[styles.text, { color: fg }]}>{title}</Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  disabled: { opacity: 0.5 },
  text: { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
});
