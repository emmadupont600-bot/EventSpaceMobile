import React from 'react';
import { Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, typography, shadow } from '../theme/colors';
import PressableScale from './PressableScale';

const GRADIENTS = {
  primary: ['#7C3AED', '#6D28D9', '#5B21B6'],
  secondary: ['#F59E0B', '#D97706', '#B45309'],
  danger: ['#F87171', '#DC2626', '#B91C1C'],
};

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
  const isFilled = variant === 'primary' || variant === 'secondary' || variant === 'danger';
  const inactive = disabled || loading;
  const pad = size === 'lg' ? { paddingVertical: 17 } : size === 'sm' ? { paddingVertical: 10, paddingHorizontal: 16 } : null;

  const content = loading
    ? <ActivityIndicator color={isFilled ? '#fff' : colors.primary} />
    : (
      <View style={styles.inner}>
        {icon ? <Ionicons name={icon} size={18} color={isFilled ? '#fff' : colors.primary} /> : null}
        <Text style={[styles.text, styles['text_' + variant]]}>{title}</Text>
      </View>
    );

  if (isFilled) {
    return (
      <PressableScale
        onPress={onPress}
        disabled={inactive}
        haptic="light"
        style={[styles.shadowWrap, variant === 'primary' && shadow.md, inactive && styles.disabled, style]}
        accessibilityLabel={title}
      >
        <LinearGradient
          colors={GRADIENTS[variant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.btn, pad]}
        >
          {content}
        </LinearGradient>
      </PressableScale>
    );
  }

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      haptic="light"
      style={[styles.btn, pad, styles[variant], inactive && styles.disabled, style]}
      accessibilityLabel={title}
    >
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  shadowWrap: { borderRadius: radius.lg },
  btn: {
    borderRadius: radius.lg,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  ghost: { backgroundColor: colors.primaryLight },
  disabled: { opacity: 0.5 },
  text: { fontSize: typography.body, fontWeight: '700', letterSpacing: 0.2 },
  text_primary: { color: '#fff' },
  text_secondary: { color: '#fff' },
  text_outline: { color: colors.primary },
  text_ghost: { color: colors.primary },
  text_danger: { color: '#fff' },
});
