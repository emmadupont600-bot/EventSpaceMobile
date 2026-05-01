import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, StatusBar, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store } from '../../utils/store';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

const AVATAR_COLORS = ['#6366F1','#EC4899','#10B981','#F59E0B','#3B82F6','#8B5CF6'];

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const insets = useSafeAreaInsets();

  useFocusEffect(useCallback(() => {
    (async () => setUser(await Store.getCurrentUser()))();
  }, []));

  const logout = () => {
    Alert.alert('🚪 Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: async () => {
        await Store.logout();
        navigation.replace('Login');
      }},
    ]);
  };

  if (!user) return (
    <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ fontSize: 64 }}>👤</Text>
      <Text style={styles.emptyText}>Non connecté</Text>
      <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginBtnText}>🔑 Se connecter</Text>
      </TouchableOpacity>
    </View>
  );

  const firstName = user.firstName || user.name?.split(' ')[0] || '';
  const lastName  = user.lastName  || user.name?.split(' ').slice(1).join(' ') || '';
  const initials  = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || '?';
  const isAnnonceur = user.role === 'annonceur';
  const avatarColor = AVATAR_COLORS[(user.id || 0) % AVATAR_COLORS.length];

  const sections = [
    {
      title: '💼 Mon compte',
      items: [
        { icon: 'user',    emoji: '👤', label: 'Mes informations',          action: () => {} },
        { icon: 'bell',    emoji: '🔔', label: 'Notifications',             action: () => {} },
        { icon: 'shield',  emoji: '🔒', label: 'Sécurité & confidentialité', action: () => {} },
      ],
    },
    ...(isAnnonceur ? [{
      title: '🏢 Espace annonceur',
      items: [
        { icon: 'home',        emoji: '🏠', label: 'Mes lieux',       action: () => navigation.navigate('Dashboard') },
        { icon: 'plus-circle', emoji: '➕',     label: 'Ajouter un lieu', action: () => navigation.navigate('Ajouter') },
        { icon: 'bar-chart-2', emoji: '📊', label: 'Statistiques',   action: () => {} },
      ],
    }] : []),
    {
      title: '📣 Aide & Support',
      items: [
        { icon: 'help-circle',    emoji: '❓', label: "Centre d'aide",        action: () => {} },
        { icon: 'message-square', emoji: '💬', label: 'Nous contacter',       action: () => {} },
        { icon: 'star',           emoji: '⭐', label: "Évaluer l'application", action: () => {} },
      ],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Hero profil */}
        <View style={styles.hero}>
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            {/* Badge role */}
            <View style={[styles.roleBadge, { backgroundColor: isAnnonceur ? colors.secondary || '#8B5CF6' : colors.success || '#10B981' }]}>
              <Text style={{ fontSize: 10 }}>{isAnnonceur ? '🏢' : '👤'}</Text>
            </View>
          </View>

          <Text style={styles.name}>{user.name || `${firstName} ${lastName}`.trim()}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {user.phone && <Text style={styles.phone}>📱 {user.phone}</Text>}

          <View style={[styles.roleTag, { backgroundColor: isAnnonceur ? '#EDE9FE' : colors.primaryLight }]}>
            <Text style={[styles.roleTagText, { color: isAnnonceur ? '#6D28D9' : colors.primary }]}>
              {isAnnonceur ? '🏢 Annonceur' : '👤 Client'}
            </Text>
          </View>

          {/* Stats rapides */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>3</Text>
              <Text style={styles.statLabel}>Résas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>2</Text>
              <Text style={styles.statLabel}>Favoris</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>5</Text>
              <Text style={styles.statLabel}>Messages</Text>
            </View>
          </View>
        </View>

        {/* Sections */}
        {sections.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={[
                    styles.menuItem,
                    ii < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={item.action}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconWrap}>
                    <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Feather name="chevron-right" size={16} color={colors.light} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Déconnexion */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={{ fontSize: 18 }}>🚪</Text>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.version}>EventSpace v2.0 — Made with ♥ in Paris</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  hero: {
    alignItems: 'center', paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  avatarWrap: { position: 'relative', marginBottom: spacing.md },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff', ...shadow.lg,
  },
  avatarImg: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 3, borderColor: '#fff',
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  roleBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: colors.bg,
  },
  name: { fontSize: typography.h2, fontWeight: '900', color: colors.dark, letterSpacing: -0.3, marginTop: 4 },
  email: { fontSize: typography.small, color: colors.mid, marginTop: 4 },
  phone: { fontSize: typography.small, color: colors.mid, marginTop: 2 },
  roleTag: {
    borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 5,
    marginTop: spacing.sm, marginBottom: spacing.lg,
  },
  roleTagText: { fontSize: typography.small, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row', backgroundColor: colors.white,
    borderRadius: radius.xl, borderWidth: 1, borderColor: colors.borderLight,
    overflow: 'hidden', width: '90%', ...shadow.xs,
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  statNum: { fontSize: typography.h2, fontWeight: '900', color: colors.dark },
  statLabel: { fontSize: typography.tiny, color: colors.mid, fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: colors.borderLight, marginVertical: spacing.sm },
  section: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: typography.small, fontWeight: '800', color: colors.dark,
    marginBottom: spacing.sm,
  },
  sectionCard: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.borderLight, overflow: 'hidden', ...shadow.xs,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  menuLabel: { flex: 1, fontSize: typography.body, fontWeight: '600', color: colors.dark },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, marginHorizontal: spacing.lg,
    backgroundColor: '#FFF0F0', borderRadius: radius.xl,
    paddingVertical: spacing.md, marginBottom: spacing.md,
    borderWidth: 1.5, borderColor: '#FECACA',
  },
  logoutText: { fontSize: typography.body, fontWeight: '700', color: colors.error || '#EF4444' },
  version: { textAlign: 'center', fontSize: typography.tiny, color: colors.light, paddingBottom: spacing.lg },
  emptyText: { fontSize: typography.h3, fontWeight: '700', color: colors.dark, marginTop: spacing.md },
  loginBtn: {
    backgroundColor: colors.primary, borderRadius: radius.xl,
    paddingHorizontal: spacing.xxl || 32, paddingVertical: spacing.md, marginTop: spacing.md,
  },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: typography.body },
});
