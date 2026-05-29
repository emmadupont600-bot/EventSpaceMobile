import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

/**
 * EmptyState réutilisable — remplace les emojis seuls par une UI cohérente.
 */
export default function EmptyState({
  icon = 'search-outline',
  iconColor,
  title,
  subtitle,
  actionLabel,
  onAction,
  emoji,
}) {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <View style={[styles.wrap, { padding: spacing.xl }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
        {emoji
          ? <Text style={styles.emoji}>{emoji}</Text>
          : <Ionicons name={icon} size={36} color={iconColor || colors.primary} />}
      </View>
      <Text style={[styles.title, { color: colors.dark, fontSize: typography.h2 }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.mid, fontSize: typography.small }]}>{subtitle}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary, borderRadius: radius.md }]}
          onPress={onAction}
        >
          <Text style={styles.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  emoji: { fontSize: 36 },
  title: { fontWeight: '800', textAlign: 'center' },
  subtitle: { textAlign: 'center', maxWidth: 280, lineHeight: 20 },
  btn: { marginTop: 12, paddingHorizontal: 24, paddingVertical: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
