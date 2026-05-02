import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { COLORS, colors, spacing, typography } from '../../theme/colors';

const P = COLORS.primary || '#4F46E5';

export default function ProfilScreen({ navigation }) {
  const { user, logout, favorites } = useApp();
  const insets = useSafeAreaInsets();
  const [notifs, setNotifs] = useState(true);

  const firstName = user?.name?.split(' ')[0] || 'Utilisateur';
  const lastName = user?.name?.split(' ').slice(1).join(' ') || '';
  const initials = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || 'U';

  const MENU = [
    {
      title: 'Mon compte',
      items: [
        { icon: 'person-outline', label: 'Modifier mon profil', onPress: () => {} },
        { icon: 'lock-closed-outline', label: 'Sécurité & mot de passe', onPress: () => {} },
        { icon: 'card-outline', label: 'Paiement & facturation', onPress: () => {} },
      ],
    },
    {
      title: 'Préférences',
      items: [
        {
          icon: 'notifications-outline', label: 'Notifications',
          right: <Switch value={notifs} onValueChange={setNotifs} trackColor={{ true: P }} thumbColor="#fff" />,
        },
        { icon: 'globe-outline', label: 'Langue', right: <Text style={styles.menuMeta}>Français</Text> },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Aide & FAQ', onPress: () => {} },
        { icon: 'chatbubble-outline', label: 'Nous contacter', onPress: () => {} },
        { icon: 'star-outline', label: 'Noter l\'app', onPress: () => {} },
      ],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon profil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero avatar */}
        <View style={styles.heroSection}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: P }]}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <TouchableOpacity style={styles.avatarEditBtn}>
              <Ionicons name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.heroName}>{user?.name || 'Utilisateur'}</Text>
          <Text style={styles.heroEmail}>{user?.email || ''}</Text>
          <View style={styles.heroBadge}>
            <Ionicons name="checkmark-circle" size={14} color={P} />
            <Text style={styles.heroBadgeText}>Compte vérifié</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>Réservations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{(favorites || []).length}</Text>
            <Text style={styles.statLabel}>Favoris</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>Avis</Text>
          </View>
        </View>

        {/* Menus */}
        {MENU.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={[
                    styles.menuItem,
                    ii < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={item.onPress}
                  activeOpacity={item.onPress ? 0.7 : 1}
                >
                  <View style={[styles.menuIconWrap, { backgroundColor: P + '14' }]}>
                    <Ionicons name={item.icon} size={18} color={P} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <View style={styles.menuRight}>
                    {item.right
                      ? item.right
                      : <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                    }
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Déconnexion */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>EventSpace v1.0.0</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },

  // Hero
  heroSection: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#fff', marginBottom: 8 },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#fff', fontSize: 32, fontWeight: '900' },
  avatarEditBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  heroName: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  heroEmail: { fontSize: 14, color: '#94A3B8', marginBottom: 10 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: P + '14', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  heroBadgeText: { fontSize: 12, color: P, fontWeight: '600' },

  // Stats
  statsRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    marginBottom: 8, paddingVertical: 16,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E2E8F0',
  },
  statBox: { flex: 1, alignItems: 'center', gap: 2 },
  statNum: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  statLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  statDivider: { width: 1, backgroundColor: '#E2E8F0' },

  // Menu
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 8, marginTop: 16, marginLeft: 4,
  },
  menuCard: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, color: '#0F172A', fontWeight: '500' },
  menuRight: { alignItems: 'flex-end' },
  menuMeta: { fontSize: 14, color: '#94A3B8' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 16,
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    marginTop: 8,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
  versionText: { textAlign: 'center', fontSize: 12, color: '#CBD5E1', marginTop: 16 },
});
