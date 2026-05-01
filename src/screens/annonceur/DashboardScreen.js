import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIEUX, RESERVATIONS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const totalReservations = RESERVATIONS.length;
  const revenu = RESERVATIONS.reduce((s, r) => s + r.montant, 0);
  const enAttente = RESERVATIONS.filter(r => r.statut === 'en attente').length;

  const stats = [
    { label: 'Lieux publiés', value: LIEUX.length.toString(), icon: 'home', color: '#e94560' },
    { label: 'Réservations', value: totalReservations.toString(), icon: 'calendar', color: '#4CAF50' },
    { label: 'En attente', value: enAttente.toString(), icon: 'time', color: '#FF9800' },
    { label: 'Revenus', value: revenu.toLocaleString() + '€', icon: 'cash', color: '#2196F3' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Bonjour,</Text>
            <Text style={styles.headerTitle}>{user?.name} 👋</Text>
          </View>
          <View style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            {enAttente > 0 && <View style={styles.notifBadge}><Text style={styles.notifBadgeTxt}>{enAttente}</Text></View>}
          </View>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '20' }]}>
                <Ionicons name={s.icon} size={22} color={s.color} />
              </View>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Mes lieux</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Ajouter lieu')}>
              <Text style={styles.sectionLink}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>
          {LIEUX.slice(0, 3).map((lieu, i) => (
            <View key={i} style={styles.lieuItem}>
              <View style={styles.lieuDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.lieuNom}>{lieu.nom}</Text>
                <Text style={styles.lieuVille}>{lieu.ville} • {lieu.capacite} pers.</Text>
              </View>
              <View style={styles.lieuPrixBox}>
                <Text style={styles.lieuPrix}>{lieu.prix.toLocaleString()}€</Text>
                <Text style={styles.lieuPrixSub}>/jour</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dernières demandes</Text>
          {RESERVATIONS.map((r, i) => (
            <View key={i} style={styles.demandeCard}>
              <View style={styles.demandeTop}>
                <Text style={styles.demandeNom}>{r.lieuNom}</Text>
                <View style={[styles.statutBadge, { borderColor: r.statut === 'confirmé' ? '#4CAF50' : '#FF9800' }]}>
                  <Text style={[styles.statutTxt, { color: r.statut === 'confirmé' ? '#4CAF50' : '#FF9800' }]}>{r.statut}</Text>
                </View>
              </View>
              <Text style={styles.demandeInfo}>{r.date} • {r.invites} invités • {r.typeEvenement}</Text>
              <Text style={styles.demandeMontant}>{r.montant.toLocaleString()}€</Text>
              {r.statut === 'en attente' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.refuseBtn}><Text style={styles.refuseTxt}>Refuser</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.acceptBtn}><Text style={styles.acceptTxt}>Accepter</Text></TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0c29' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 16 },
  headerSub: { color: '#aaa', fontSize: 13 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  notifBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#e94560', borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  notifBadgeTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
  statCard: { width: '47%', backgroundColor: '#1a1a2e', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'flex-start' },
  statIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statVal: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: '#aaa', fontSize: 12 },
  section: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  sectionLink: { color: '#e94560', fontSize: 14, fontWeight: '600' },
  lieuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  lieuDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 12 },
  lieuNom: { color: '#fff', fontWeight: '600', fontSize: 14 },
  lieuVille: { color: '#aaa', fontSize: 12, marginTop: 2 },
  lieuPrixBox: { alignItems: 'flex-end' },
  lieuPrix: { color: '#e94560', fontWeight: '800', fontSize: 15 },
  lieuPrixSub: { color: '#666', fontSize: 11 },
  demandeCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  demandeTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  demandeNom: { color: '#fff', fontWeight: '700', fontSize: 14, flex: 1, marginRight: 8 },
  statutBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  statutTxt: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  demandeInfo: { color: '#aaa', fontSize: 12, marginBottom: 4 },
  demandeMontant: { color: '#e94560', fontWeight: '800', fontSize: 15 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  refuseBtn: { flex: 1, borderWidth: 1, borderColor: '#e94560', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  refuseTxt: { color: '#e94560', fontWeight: '700', fontSize: 13 },
  acceptBtn: { flex: 1, backgroundColor: '#4CAF50', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  acceptTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
