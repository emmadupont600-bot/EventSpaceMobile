import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RESERVATIONS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

const STATUT_COLORS = { 'confirmé': '#4CAF50', 'en attente': '#FF9800', 'refusé': '#e94560' };
const STATUT_ICONS = { 'confirmé': 'checkmark-circle', 'en attente': 'time', 'refusé': 'close-circle' };

export default function ReservationsScreen() {
  const { user } = useAuth();
  const reservations = user?.role === 'annonceur' ? RESERVATIONS : RESERVATIONS.filter(r => r.clientId === user?.id || true);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{user?.role === 'annonceur' ? 'Demandes reçues' : 'Mes Réservations'}</Text>
        <Text style={styles.sub}>{reservations.length} réservation{reservations.length > 1 ? 's' : ''}</Text>
      </View>
      <FlatList
        data={reservations}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={64} color="#444" />
            <Text style={styles.emptyTxt}>Aucune réservation</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.lieuImage }} style={styles.img} />
            <View style={styles.body}>
              <View style={styles.top}>
                <Text style={styles.lieuNom} numberOfLines={1}>{item.lieuNom}</Text>
                <View style={[styles.statutBadge, { backgroundColor: STATUT_COLORS[item.statut] + '22', borderColor: STATUT_COLORS[item.statut] }]}>
                  <Ionicons name={STATUT_ICONS[item.statut]} size={12} color={STATUT_COLORS[item.statut]} />
                  <Text style={[styles.statutTxt, { color: STATUT_COLORS[item.statut] }]}>{item.statut}</Text>
                </View>
              </View>
              <View style={styles.infoRow}><Ionicons name="calendar-outline" size={13} color="#aaa" /><Text style={styles.infoTxt}>{item.date}</Text></View>
              <View style={styles.infoRow}><Ionicons name="time-outline" size={13} color="#aaa" /><Text style={styles.infoTxt}>{item.heureDebut} - {item.heureFin}</Text></View>
              <View style={styles.infoRow}><Ionicons name="people-outline" size={13} color="#aaa" /><Text style={styles.infoTxt}>{item.invites} invités • {item.typeEvenement}</Text></View>
              <Text style={styles.montant}>{item.montant.toLocaleString()}€</Text>
              {user?.role === 'annonceur' && item.statut === 'en attente' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.refuseBtn}><Text style={styles.refuseTxt}>Refuser</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.acceptBtn}><Text style={styles.acceptTxt}>Accepter</Text></TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0c29' },
  header: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  sub: { color: '#aaa', fontSize: 13, marginTop: 4 },
  list: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 14, marginBottom: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  img: { width: '100%', height: 120 },
  body: { padding: 14 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  lieuNom: { color: '#fff', fontWeight: '700', fontSize: 15, flex: 1, marginRight: 8 },
  statutBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  statutTxt: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  infoTxt: { color: '#aaa', fontSize: 13 },
  montant: { color: '#e94560', fontSize: 18, fontWeight: '800', marginTop: 6 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  refuseBtn: { flex: 1, borderWidth: 1, borderColor: '#e94560', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  refuseTxt: { color: '#e94560', fontWeight: '700' },
  acceptBtn: { flex: 1, backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  acceptTxt: { color: '#fff', fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTxt: { color: '#aaa', fontSize: 18, fontWeight: '700', marginTop: 16 },
});
