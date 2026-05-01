import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const config = {
  pending:   { bg: '#fef3c7', text: '#92400e', label: '⏳ En attente' },
  confirmed: { bg: '#d1fae5', text: '#065f46', label: '✅ Confirmée' },
  cancelled: { bg: '#fee2e2', text: '#991b1b', label: '❌ Annulée' },
};

export default function StatusBadge({ status }) {
  const c = config[status] || config.pending;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '700' },
});
