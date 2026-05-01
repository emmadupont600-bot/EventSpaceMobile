import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store } from '../../utils/store';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const insets = useSafeAreaInsets();

  useFocusEffect(useCallback(() => {
    (async () => setUser(await Store.getCurrentUser()))();
  }, []));

  const logout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: async () => {
        await Store.logout();
        navigation.replace('Login');
      }},
    ]);
  };

  if (!user) return (
    <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
      <Feather name="user" size={48} color={colors.light} />
      <Text style={styles.emptyText}>Non connecté</Text>
      <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginBtnText}>Se connecter</Text>
      </TouchableOpacity>
    </View>
  );

  const firstName = user.firstName || user.name?.split(' ')[0] || '';
  const lastName  = user.lastName  || user.name?.split(' ').slice(1).join(' ') || '';
  const initials  = (firstName[0] || '?').toUpperCase();
  const isAnnonceur = user.role === 'annonceur';

  const sections = [
    {
      title: 'Mon compte',
      items: [
        { icon: 'user', label: 'Mes informations', action: () => {} },
        { icon: 'bell', label: 'Notifications', action: () => {} },
        { icon: 'shield', label: 'Sécurité & confidentialité', action: () => {} },
      ],
    },
    ...(isAnnonceur ? [{
      title: 'Espace annonceur',
      items: [
        { icon: 'home', label: 'Mes lieux', action: () => navigation.navigate('Dashboard') },
        { icon: 'plus-circle', label: 'Ajouter un lieu', action: () => navigation.navigate('Ajouter') },
        { icon: 'bar-chart-2', label: 'Statistiques', action: () => {} },
      ],
    }] : []),
    {
      title: 'Aide',
      items: [
        { icon: 'help-circle', label: "Centre d'aide", action: () => {} },
        { icon: 'message-square', label: 'Nous contacter', action: () => {} },
        { icon: 'star', label: "Évaluer l'application", action: () => {} },
      ],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Hero profil */}
        <View style={styles.hero}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: isAnnonceur ? colors.secondary : colors.primary }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.roleBadge}>
              <Feather name={isAnnonceur ? 'briefcase' : 'user'} size={10} color="#fff" />
            </View>
          </View>
          <Text style={styles.name}>{user.name || `${firstName} ${lastName}`}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={[styles.roleTag, { backgroundColor: isAnnonceur ? colors.secondaryLight : colors.primaryLight }]}>
            <Text style={[styles.roleTagText, { color: isAnnonceur ? colors.secondary : colors.primary }]}>
              {isAnnonceur ? '🏢 Annonceur' : '👤 Client'}
            </Text>
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
                    <Feather name={item.icon} size={17} color={colors.primary} />
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
          <Feather name="log-out" size={18} color={colors.error} />
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
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.lg,
  },
  avatarText: { color: '#fff', fontSize: typography.h1, fontWeight: '900' },
  roleBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.success,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: colors.bg,
  },
  name: { fontSize: typography.h2, fontWeight: '900', color: colors.dark, letterSpacing: -0.3 },
  email: { fontSize: typography.small, color: colors.mid, marginTop: 4, marginBottom: spacing.sm },
  roleTag: {
    borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 5,
  },
  roleTagText: { fontSize: typography.small, fontWeight: '700' },
  section: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: typography.tiny, fontWeight: '700', color: colors.mid,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm,
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
    width: 34, height: 34, borderRadius: radius.sm,
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
  logoutText: { fontSize: typography.body, fontWeight: '700', color: colors.error },
  version: { textAlign: 'center', fontSize: typography.tiny, color: colors.light, paddingBottom: spacing.lg },
  emptyText: { fontSize: typography.h3, fontWeight: '700', color: colors.dark, marginTop: spacing.md },
  loginBtn: {
    backgroundColor: colors.primary, borderRadius: radius.xl,
    paddingHorizontal: spacing.xxl, paddingVertical: spacing.md, marginTop: spacing.md,
  },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: typography.body },
});
