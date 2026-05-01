import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { VENUES } from '../../data/venues';
import { COLORS } from '../../theme/colors';

export default function AnnonceurDashboard({ navigation }) {
  const { user, reservations, updateReservationStatus } = useApp();
  const myVenues = VENUES.filter(v => v.annonceurId === user.id);
  const totalRevenu = reservations.filter(r => r.status === 'confirmed').reduce((sum, r) => sum + r.price, 0);
  const pending = reservations.filter(r => r.status === 'pending');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>Tableau de bord annonceur</Text>
        </View>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user?.avatar}</Text></View>
      </View>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: COLORS.primary }]}>
          <Ionicons name="home" size={22} color="rgba(255,255,255,0.9)" />
          <Text style={styles.statValue}>{myVenues.length}</Text>
          <Text style={styles.statLabel}>Lieux publiés</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.success }]}>
          <Ionicons name="cash" size={22} color="rgba(255,255,255,0.9)" />
          <Text style={styles.statValue}>{totalRevenu}€</Text>
          <Text style={styles.statLabel}>Revenus</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.warning }]}>
          <Ionicons name="time" size={22} color="rgba(255,255,255,0.9)" />
          <Text style={styles.statValue}>{pending.length}</Text>
          <Text style={styles.statLabel}>En attente</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.secondary }]}>
          <Ionicons name="calendar" size={22} color="rgba(255,255,255,0.9)" />
          <Text style={styles.statValue}>{reservations.length}</Text>
          <Text style={styles.statLabel}>Total resas</Text>
        </View>
      </View>
      {pending.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Demandes en attente</Text>
          {pending.map(r => (
            <View key={r.id} style={styles.requestCard}>
              <View style={styles.requestInfo}>
                <Text style={styles.requestName}>{r.userName}</Text>
                <Text style={styles.requestDetails}>{r.venueName} · {r.date}</Text>
                <Text style={styles.requestDetails}>{r.guests} invités · {r.eventType}</Text>
                <Text style={styles.requestPrice}>{r.total}€ total</Text>
              </View>
              <View style={styles.requestActions}>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => updateReservationStatus(r.id, 'confirmed')}>
                  <Ionicons name="checkmark" size={18} color={COLORS.white} />
                  <Text style={styles.acceptText}>Accepter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => updateReservationStatus(r.id, 'rejected')}>
                  <Ionicons name="close" size={18} color={COLORS.error} />
                  <Text style={styles.rejectText}>Refuser</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏛️ Mes lieux</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddVenue')}>
            <Ionicons name="add" size={18} color={COLORS.white} />
            <Text style={styles.addBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
        {myVenues.map(venue => (
          <View key={venue.id} style={styles.venueCard}>
            <View style={styles.venueCardLeft}>
              <Text style={{ fontSize: 28 }}>{venue.type === 'Loft' ? '🏙️' : venue.type === 'Rooftop' ? '🌆' : venue.type === 'Domaine' ? '🏰' : venue.type === 'Studio' ? '🎨' : '🏛️'}</Text>
            </View>
            <View style={styles.venueCardBody}>
              <Text style={styles.venueName}>{venue.name}</Text>
              <Text style={styles.venueLocation}>{venue.location}</Text>
              <View style={styles.venueStats}>
                <Text style={styles.venuePrice}>{venue.price}€/j</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.venueRating}>{venue.rating}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.chatIconBtn} onPress={() => navigation.navigate('Chat', { venue })}>
              <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  greeting: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 20, gap: 12 },
  statCard: { flex: 1, minWidth: '44%', borderRadius: 16, padding: 16, gap: 4, alignItems: 'flex-start' },
  statValue: { fontSize: 24, fontWeight: '800', color: COLORS.white },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  section: { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  requestCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FEF3C7', borderLeftWidth: 4, borderLeftColor: '#F59E0B', gap: 12 },
  requestInfo: { gap: 4 },
  requestName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  requestDetails: { fontSize: 13, color: COLORS.textSecondary },
  requestPrice: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginTop: 4 },
  requestActions: { flexDirection: 'row', gap: 10 },
  acceptBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.success, borderRadius: 10, paddingVertical: 12 },
  acceptText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FEE2E2', borderRadius: 10, paddingVertical: 12 },
  rejectText: { fontSize: 14, fontWeight: '700', color: COLORS.error },
  venueCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  venueCardLeft: { width: 56, height: 56, borderRadius: 14, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  venueCardBody: { flex: 1, gap: 4 },
  venueName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  venueLocation: { fontSize: 12, color: COLORS.textSecondary },
  venueStats: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 2 },
  venuePrice: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  venueRating: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  chatIconBtn: { padding: 8, backgroundColor: COLORS.primaryLight, borderRadius: 10 },
});
