import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Image, Alert, ScrollView,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { SEED_USER } from '../../data/seedData';

const MENU_ITEMS = [
  { icon: '📅', label: 'Mes réservations', screen: 'Reservations' },
  { icon: '❤️', label: 'Mes favoris', screen: 'Favorites' },
  { icon: '💬', label: 'Mes messages', screen: 'ChatList' },
  { icon: '🔔', label: 'Notifications', screen: null },
  { icon: '🔒', label: 'Sécurité & confidentialité', screen: null },
  { icon: '⭐', label: 'Mes avis', screen: null },
  { icon: '❓', label: 'Aide & support', screen: null },
];

export default function ProfilScreen({ navigation }) {
  const user = SEED_USER;
  const [avatarError, setAvatarError] = useState(false);
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;

  const handleEdit = () =>
    Alert.alert('Modifier le profil', 'Cette fonctionnalité sera bientôt disponible.');

  const handleLogout = () =>
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: () => navigation.replace('Login') },
    ]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero profil */}
        <View style={styles.hero}>
          <View style={styles.avatarWrapper}>
            {user.avatar && !avatarError ? (
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatar}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarBtn} onPress={handleEdit}>
              <Text style={styles.editAvatarIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <TouchableOpacity style={styles.editProfileBtn} onPress={handleEdit}>
            <Text style={styles.editProfileText}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Réservations', value: user.reservations },
            { label: 'Favoris', value: user.favorites?.length || 0 },
            { label: 'Membre depuis', value: user.memberSince },
          ].map((s, i) => (
            <View key={i} style={[styles.statItem, i < 2 && styles.statBorder]}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
              onPress={() =>
                item.screen
                  ? navigation.navigate(item.screen)
                  : Alert.alert('Bientôt disponible', 'Cette section arrive prochainement.')
              }
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>🚪 Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.version}>EventSpace v1.0.0 · Made with ❤️</Text>
        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const P = COLORS.primary || '#4F46E5';
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  hero: {
    alignItems: 'center', paddingTop: 32, paddingBottom: 28,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  avatarWrapper: { position: 'relative', marginBottom: 16 },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 3, borderColor: P,
  },
  avatarFallback: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: P, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#C7D2FE',
  },
  avatarInitials: { color: '#fff', fontSize: 34, fontWeight: '800' },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#fff', borderWidth: 2, borderColor: '#E2E8F0',
    alignItems: 'center', justifyContent: 'center',
  },
  editAvatarIcon: { fontSize: 14 },
  userName: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  userEmail: { fontSize: 14, color: '#94A3B8', marginTop: 4, marginBottom: 16 },
  editProfileBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20,
  },
  editProfileText: { color: P, fontSize: 14, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    marginTop: 12, marginHorizontal: 16,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statBorder: { borderRightWidth: 1, borderRightColor: '#E2E8F0' },
  statValue: { fontSize: 20, fontWeight: '800', color: P },
  statLabel: { fontSize: 11, color: '#94A3B8', marginTop: 3, textAlign: 'center' },
  menuSection: {
    backgroundColor: '#fff', marginTop: 16, marginHorizontal: 16,
    borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, gap: 14,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuIcon: { fontSize: 20, width: 24, textAlign: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: '#0F172A', fontWeight: '500' },
  menuArrow: { fontSize: 22, color: '#CBD5E1' },
  logoutBtn: {
    margin: 16, backgroundColor: '#FEF2F2',
    borderRadius: 14, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#FECACA',
  },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: 12, color: '#CBD5E1', marginBottom: 8 },
});
