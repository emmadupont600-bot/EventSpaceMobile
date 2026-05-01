import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Store } from '../../utils/store';
import Header from '../../components/Header';
import Button from '../../components/Button';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useFocusEffect(useCallback(() => {
    (async () => setUser(await Store.getCurrentUser()))();
  }, []));

  const logout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Oui', style: 'destructive', onPress: async () => {
        await Store.logout();
        navigation.replace('Login');
      }}
    ]);
  };

  if (!user) return (
    <View style={styles.container}>
      <Header title="Mon profil" />
      <View style={styles.center}>
        <Ionicons name="person-outline" size={48} color={colors.light} />
        <Text style={styles.emptyTxt}>Non connecté</Text>
        <Button title="Se connecter" onPress={() => navigation.navigate('Login')} style={{ marginTop: spacing.lg }} />
      </View>
    </View>
  );

  const menuItems = [
    ...(user.role === 'annonceur' ? [
      { icon: 'add-circle-outline', label: 'Ajouter un lieu', screen: 'AddVenue', color: colors.primary },
      { icon: 'business-outline', label: 'Mes lieux', screen: 'MyVenues', color: colors.primary },
    ] : []),
    { icon: 'heart-outline', label: 'Mes favoris', screen: 'Favorites', color: '#ef4444' },
    { icon: 'calendar-outline', label: 'Mes réservations', screen: 'Reservations', color: colors.secondary },
    { icon: 'chatbubbles-outline', label: 'Messages', screen: 'Conversations', color: colors.warning },
    { icon: 'help-circle-outline', label: 'Aide & Support', screen: null, color: colors.mid },
  ];

  return (
    <View style={styles.container}>
      <Header title="Mon profil" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarTxt}>{user.firstName[0]}{user.lastName?.[0] || ''}</Text>
          </View>
          <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleTxt}>
              {user.role === 'annonceur' ? '🏢 Annonceur' : '👤 Particulier'}
            </Text>
          </View>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[{ label: 'Réservations', val: 2 }, { label: 'Favoris', val: 3 }, { label: 'Avis', val: 1 }].map(s => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => item.screen ? navigation.navigate(item.screen) : Alert.alert('Bientôt disponible', 'Cette fonctionnalité arrive prochainement.')}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.light} />
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Se déconnecter" variant="outline" onPress={logout} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', paddingTop: 80, gap: spacing.sm },
  emptyTxt: { fontSize: typography.h3, fontWeight: '700', color: colors.mid },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarTxt: { color: '#fff', fontSize: 28, fontWeight: '900' },
  userName: { fontSize: typography.h2, fontWeight: '800', color: colors.dark },
  roleBadge: { backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6, marginBottom: 4 },
  roleTxt: { fontSize: typography.small, color: colors.primary, fontWeight: '700' },
  email: { fontSize: typography.small, color: colors.mid },
  statsRow: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, ...shadow.sm },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: typography.h2, fontWeight: '900', color: colors.primary },
  statLabel: { fontSize: typography.tiny, color: colors.mid, marginTop: 2 },
  menu: { backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden', ...shadow.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  menuIcon: { width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: typography.body, fontWeight: '600', color: colors.dark },
});
