import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, Image, SafeAreaView, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIEUX } from '../../data/mockData';

const CATEGORIES = ['Tous', 'Mariage', 'Séminaire', 'Soirée', 'Conférence'];

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Tous');

  const filtered = LIEUX.filter(l =>
    (cat === 'Tous' || l.categorie === cat) &&
    (l.nom.toLowerCase().includes(search.toLowerCase()) ||
     l.ville.toLowerCase().includes(search.toLowerCase()))
  );

  const renderLieu = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Detail', { lieu: item })} activeOpacity={0.9}>
      <Image source={{ uri: item.image }} style={styles.cardImg} />
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>{item.categorie}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardNom} numberOfLines={1}>{item.nom}</Text>
          <View style={styles.noteRow}>
            <Ionicons name="star" size={12} color="#f4c430" />
            <Text style={styles.note}>{item.note}</Text>
          </View>
        </View>
        <View style={styles.cardMid}>
          <Ionicons name="location-outline" size={14} color="#aaa" />
          <Text style={styles.cardVille}>{item.ville}</Text>
          <Ionicons name="people-outline" size={14} color="#aaa" style={{ marginLeft: 10 }} />
          <Text style={styles.cardVille}>{item.capacite} pers.</Text>
        </View>
        <View style={styles.cardBot}>
          <Text style={styles.prix}>{item.prix.toLocaleString()}€<Text style={styles.prixSub}>/jour</Text></Text>
          <TouchableOpacity style={styles.reservBtn} onPress={() => navigation.navigate('Reservation', { lieu: item })}>
            <Text style={styles.reservTxt}>Réserver</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Bienvenue sur</Text>
          <Text style={styles.headerTitle}>EventSpace 🎉</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </View>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={20} color="#aaa" style={{ marginHorizontal: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Chercher un lieu, une ville..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color="#aaa" style={{ marginRight: 10 }} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={i => i}
        style={styles.catList}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.catBtn, cat === item && styles.catBtnActive]} onPress={() => setCat(item)}>
            <Text style={[styles.catTxt, cat === item && styles.catTxtActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.resultTxt}>{filtered.length} lieu{filtered.length > 1 ? 'x' : ''} trouvé{filtered.length > 1 ? 's' : ''}</Text>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderLieu}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search" size={60} color="#444" />
            <Text style={styles.emptyTxt}>Aucun lieu trouvé</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0c29' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerSub: { color: '#aaa', fontSize: 13 },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '800' },
  headerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchInput: { flex: 1, color: '#fff', paddingVertical: 12, fontSize: 15 },
  catList: { marginBottom: 12 },
  catBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  catBtnActive: { backgroundColor: '#e94560', borderColor: '#e94560' },
  catTxt: { color: '#aaa', fontSize: 13, fontWeight: '600' },
  catTxtActive: { color: '#fff' },
  resultTxt: { color: '#aaa', fontSize: 13, paddingHorizontal: 20, marginBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardImg: { width: '100%', height: 180 },
  badge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#e94560', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardBody: { padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardNom: { fontSize: 16, fontWeight: '700', color: '#fff', flex: 1, marginRight: 8 },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  note: { color: '#f4c430', fontSize: 13, fontWeight: '600' },
  cardMid: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardVille: { color: '#aaa', fontSize: 13, marginLeft: 4 },
  cardBot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prix: { fontSize: 20, fontWeight: '800', color: '#e94560' },
  prixSub: { fontSize: 13, fontWeight: '400', color: '#aaa' },
  reservBtn: { backgroundColor: '#e94560', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 9 },
  reservTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTxt: { color: '#666', fontSize: 16, marginTop: 12 },
});
