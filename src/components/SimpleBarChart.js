import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/** Graphique en barres simple sans dépendance externe */
export default function SimpleBarChart({ data = [], labelKey = 'label', valueKey = 'value' }) {
  const { colors, spacing, typography } = useTheme();
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1);

  if (!data.length) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.white, borderColor: colors.border }]}>
        <Text style={{ color: colors.mid, fontSize: typography.small }}>Pas encore de données</Text>
      </View>
    );
  }

  return (
    <View style={[styles.chart, { backgroundColor: colors.white, borderColor: colors.border }]}>
      <View style={styles.bars}>
        {data.map((item, i) => {
          const h = Math.max(4, ((item[valueKey] || 0) / max) * 100);
          return (
            <View key={i} style={styles.barCol}>
              <View style={[styles.barTrack, { backgroundColor: colors.borderLight || colors.border }]}>
                <View style={[styles.barFill, { height: `${h}%`, backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.barLabel, { color: colors.mid }]} numberOfLines={1}>
                {item[labelKey]}
              </Text>
              <Text style={[styles.barValue, { color: colors.dark }]}>
                {(item[valueKey] || 0).toLocaleString('fr-FR')}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { borderRadius: 14, borderWidth: 1, padding: 12 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 120 },
  barCol: { flex: 1, alignItems: 'center', height: '100%' },
  barTrack: { flex: 1, width: '100%', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 9, marginTop: 4, fontWeight: '600' },
  barValue: { fontSize: 10, fontWeight: '700' },
  empty: { borderRadius: 14, borderWidth: 1, padding: 24, alignItems: 'center' },
});
