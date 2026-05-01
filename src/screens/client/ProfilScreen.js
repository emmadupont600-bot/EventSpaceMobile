import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const MENU = [
  { icon: 'person-outline', label: 'Modifier le profil', color: '#e94560' },
  { icon: 'notifications-outline', label: 'Notifications', color: '#FF9800' },
  { icon: 'shield-checkmark-outline', label: 'Sécurité', color: '#4CAF50' },
  { icon: 'help-circle-outline', label: 'Aide & Support', color: '#2196F3' },
  { icon: 'document-text-outline', label: 'CGU & Confidentialité', color: '#9C27B0' },
  { icon: 'star-outline', label: 'Noter l\'app', color: '#f4c430' },
];

export default function ProfilScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{user?.name?.charAt(0)?.toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name={user?.role === 'annonceur' ? 'business' : 'person'} size={14} color="#e94560" />
            <Text style={styles.roleTxt}>{user?.role === 'annonceur' ? 'Annonceur' : 'Client'}</Text>
          </View>
        </View>

        {user?.role === 'client' && (
          <View style={styles.statsRow}>
            {[{ label: 'Réservations', value: '2' }, { label: 'Favoris', value: '3' }, { label: 'Avis', value: '1' }].map((s, i) => (
              <View key={i} style={styles.stat}>
                <Text style={styles.statVal}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          {MENU.map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#555" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Déconnecter', style: 'destructive', onPress: logout }
          ])}
        >
          <Ionicons name="log-out-outline" size={22} color="#e94560" />
          <Text style={styles.logoutTxt}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.version}>EventSpace v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0c29' },
  header: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#e94560', justifyContent: 'center', alignItems: 'center', marginBottom: 14, shadowColor: '#e94560', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
  avatarTxt: { fontSize: 36, fontWeight: '800', color: '#fff' },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  email: { color: '#aaa', fontSize: 14, marginBottom: 10 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(233,69,96,0.15)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(233,69,96,0.3)' },
  roleTxt: { color: '#e94560', fontWeight: '700', fontSize: 13 },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { color: '#fff', fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#aaa', fontSize: 12, marginTop: 2 },
  section: { marginHorizontal: 20, backgroundColor: '#1a1a2e', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  menuIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuLabel: { flex: 1, color: '#ddd', fontSize: 15 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 20, backgroundColor: 'rgba(233,69,96,0.1)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(233,69,96,0.3)', marginBottom: 16 },
  logoutTxt: { color: '#e94560', fontWeight: '700', fontSize: 16 },
  version: { textAlign: 'center', color: '#555', fontSize: 12, paddingBottom: 20 },
});
