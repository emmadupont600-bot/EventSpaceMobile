import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../theme/colors';

const MENU_ITEMS = [
  { icon: 'notifications-outline', label: 'Notifications', color: COLORS.primary },
  { icon: 'shield-checkmark-outline', label: 'Sécurité & Confidentialité', color: COLORS.success },
  { icon: 'help-circle-outline', label: 'Aide & Support', color: COLORS.accent },
  { icon: 'star-outline', label: 'Donner un avis', color: COLORS.warning },
  { icon: 'information-circle-outline', label: 'À propos', color: COLORS.textSecondary },
];

export default function ProfileScreen() {
  const { user, logout, reservations, favorites } = useApp();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}><Text style={styles.avatarText}>{user?.avatar}</Text></View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: user?.role === 'annonceur' ? '#FEF3C7' : COLORS.primaryLight }]}>
          <Text style={[styles.roleText, { color: user?.role === 'annonceur' ? '#D97706' : COLORS.primary }]}>
            {user?.role === 'annonceur' ? '🏢 Annonceur' : '👤 Particulier'}
          </Text>
        </View>
      </View>
      {user?.role === 'client' && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{reservations.length}</Text>
            <Text style={styles.statLabel}>Réservations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Favoris</Text>
          </View>
        </View>
      )}
      <View style={styles.menuCard}>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity key={i} style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuItemBorder]} activeOpacity={0.7}>
            <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
      <Text style={styles.version}>EventSpace v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  profileHeader: { alignItems: 'center', paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  avatarLarge: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  avatarText: { fontSize: 32, fontWeight: '800', color: COLORS.white },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  email: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 },
  roleBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  roleText: { fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', backgroundColor: COLORS.surface, marginHorizontal: 20, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  statValue: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  menuCard: { backgroundColor: COLORS.surface, marginHorizontal: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: COLORS.text },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FEE2E2', marginHorizontal: 20, borderRadius: 16, padding: 18, marginBottom: 16 },
  logoutText: { fontSize: 16, fontWeight: '700', color: COLORS.error },
  version: { textAlign: 'center', fontSize: 12, color: COLORS.textLight, paddingBottom: 40 },
});
