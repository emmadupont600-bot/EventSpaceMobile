import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../theme/colors';

export default function VenueDetailScreen({ route, navigation }) {
  const { venue } = route.params;
  const { favorites, toggleFavorite } = useApp();
  const isFav = favorites.includes(venue.id);
  const categoryColors = { Soirée: '#6C63FF', Mariage: '#FF6584', Professionnel: '#43C6AC', Anniversaire: '#F59E0B' };
  const icons = { Loft: '🏙️', Rooftop: '🌆', Domaine: '🏰', Studio: '🎨', Bureau: '💼', Salle: '🏛️' };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: categoryColors[venue.category] || COLORS.primary }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favBtn} onPress={() => toggleFavorite(venue.id)}>
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? COLORS.secondary : COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.heroIcon}>{icons[venue.type] || '🏛️'}</Text>
          <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>{venue.type}</Text></View>
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{venue.name}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{venue.rating}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}><Ionicons name="location" size={14} color={COLORS.primary} /><Text style={styles.infoText}>{venue.location}</Text></View>
            <View style={styles.infoItem}><Ionicons name="people" size={14} color={COLORS.primary} /><Text style={styles.infoText}>{venue.capacity} personnes</Text></View>
            <View style={styles.infoItem}><Ionicons name="chatbubble" size={14} color={COLORS.primary} /><Text style={styles.infoText}>{venue.reviews} avis</Text></View>
          </View>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{venue.description}</Text>
          <Text style={styles.sectionTitle}>Équipements</Text>
          <View style={styles.amenitiesGrid}>
            {venue.amenities.map((a, i) => (
              <View key={i} style={styles.amenityChip}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
          </View>
          <View style={styles.annonceurCard}>
            <View style={styles.annonceurAvatar}><Text style={styles.annonceurAvatarText}>{venue.annonceurName.slice(0,2).toUpperCase()}</Text></View>
            <View style={styles.annonceurInfo}>
              <Text style={styles.annonceurName}>{venue.annonceurName}</Text>
              <Text style={styles.annonceurRole}>Annonceur vérifié ✓</Text>
            </View>
            <TouchableOpacity style={styles.chatBtn} onPress={() => navigation.navigate('Chat', { venue })}>
              <Ionicons name="chatbubble-ellipses" size={16} color={COLORS.primary} />
              <Text style={styles.chatBtnText}>Contacter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerPrice}>{venue.price}€</Text>
          <Text style={styles.footerPriceUnit}>par jour</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('Booking', { venue })}>
          <Text style={styles.bookBtnText}>Réserver maintenant</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hero: { height: 260, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  backBtn: { position: 'absolute', top: 52, left: 20, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 10 },
  favBtn: { position: 'absolute', top: 52, right: 20, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 10 },
  heroIcon: { fontSize: 80 },
  heroBadge: { position: 'absolute', bottom: 20, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  heroBadgeText: { fontSize: 13, fontWeight: '700', color: COLORS.white },
  content: { padding: 20, gap: 16, paddingBottom: 100 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 24, fontWeight: '800', color: COLORS.text, flex: 1, marginRight: 12 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  ratingText: { fontSize: 14, fontWeight: '700', color: '#D97706' },
  infoRow: { flexDirection: 'row', gap: 16 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  description: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border },
  amenityText: { fontSize: 13, fontWeight: '500', color: COLORS.text },
  annonceurCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  annonceurAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  annonceurAvatarText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  annonceurInfo: { flex: 1, marginLeft: 12 },
  annonceurName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  annonceurRole: { fontSize: 12, color: COLORS.success },
  chatBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primaryLight, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  chatBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12 },
  footerPrice: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  footerPriceUnit: { fontSize: 13, color: COLORS.textSecondary },
  bookBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 16, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  bookBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
});
