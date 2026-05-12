/**
 * ReservationsScreen.js — mis à jour
 * Affiche la liste des réservations du client
 * avec bouton "Payer" si statut = 'accepted' + payment_status = 'pending_payment'
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../utils/supabase';
import { useApp } from '../../context/AppContext';

const P = '#4F46E5';

const STATUS_CONFIG = {
  pending:          { label: 'En attente',     color: '#F59E0B', bg: '#FEF3C7', icon: 'time-outline' },
  accepted:         { label: 'Acceptée',       color: '#10B981', bg: '#D1FAE5', icon: 'checkmark-circle-outline' },
  pending_payment:  { label: 'À payer',        color: P,         bg: '#EEF2FF', icon: 'card-outline' },
  paid:             { label: 'Payée ✅',        color: '#10B981', bg: '#D1FAE5', icon: 'shield-checkmark-outline' },
  refused:          { label: 'Refusée',        color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle-outline' },
  cancelled:        { label: 'Annulée',        color: '#6B7280', bg: '#F3F4F6', icon: 'ban-outline' },
};

export default function ReservationsScreen({ navigation }) {
  const { user } = useApp();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  const fetchReservations = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (e) {
      console.error('Erreur chargement réservations:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchReservations();

    // Realtime Supabase — mise à jour auto si statut change
    const channel = supabase
      .channel('reservations-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'reservations', filter: `user_id=eq.${user?.id}` },
        () => fetchReservations()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchReservations]);

  const handlePay = (reservation) => {
    navigation.navigate('Payment', {
      reservation: {
        id:        reservation.id,
        total:     reservation.total,
        venueName: reservation.venue_name,
        date:      reservation.date,
      },
    });
  };

  const renderItem = ({ item }) => {
    const status = STATUS_CONFIG[item.payment_status === 'pending_payment' ? 'pending_payment' : item.status] || STATUS_CONFIG.pending;
    const canPay = item.status === 'accepted' && item.payment_status === 'pending_payment';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.venueName}>{item.venue_name}</Text>
            <Text style={styles.dateText}>📅 {item.date} · {item.start || ''}{item.end ? ` → ${item.end}` : ''}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={13} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.totalText}>{item.total?.toLocaleString('fr-FR')}€</Text>
          {canPay && (
            <TouchableOpacity style={styles.payBtn} onPress={() => handlePay(item)} activeOpacity={0.85}>
              <Ionicons name="card" size={16} color="#fff" />
              <Text style={styles.payBtnText}>Payer maintenant</Text>
            </TouchableOpacity>
          )}
          {item.payment_status === 'paid' && (
            <View style={styles.paidBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <Text style={styles.paidText}>Payée</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes réservations</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={P} />
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReservations(); }} tintColor={P} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Aucune réservation</Text>
              <Text style={styles.emptyText}>Vos réservations apparaîtront ici</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: '#F8FAFC' },
  header:           { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle:      { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  list:             { padding: 16, gap: 12, paddingBottom: 40 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card:             { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader:       { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  venueName:        { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  dateText:         { fontSize: 13, color: '#64748B' },
  statusBadge:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText:       { fontSize: 12, fontWeight: '700' },
  cardFooter:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  totalText:        { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  payBtn:           { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: P, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  payBtnText:       { color: '#fff', fontWeight: '700', fontSize: 14 },
  paidBadge:        { flexDirection: 'row', alignItems: 'center', gap: 4 },
  paidText:         { fontSize: 14, fontWeight: '600', color: '#10B981' },
  empty:            { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyTitle:       { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  emptyText:        { fontSize: 14, color: '#94A3B8' },
});
