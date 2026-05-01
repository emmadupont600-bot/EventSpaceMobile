import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIEUX } from '../../data/mockData';

export default function FavorisScreen({ navigation }) {
  const [favoris, setFavoris] = useState([LIEUX[0], LIEUX[2], LIEUX[4]]);

  const remove = (id) => setFavoris(f => f.filter(l => l.id !== id));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Favoris</Text>
        <Text style={styles.sub}>{favoris.length} lieu{favoris.length > 1 ? 'x' : ''} sauvegardé{favoris.length > 1 ? 's' : ''}</Text>
      </View>
      <FlatList
        data={favoris}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={64} color="#444" />
            <Text style={styles.emptyTxt}>Aucun favori</Text>
            <Text style={styles.emptySub}>Appuyez sur ♥ sur un lieu pour l'ajouter</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.img} />
            <View style={styles.cardBody}>
              <Text style={styles.cardNom} numberOfLines={1}>{item.nom}</Text>
              <View style={styles.row}>
                <Ionicons name="location-outline" size={13} color="#aaa" />
                <Text style={styles.cardVille}>{item.ville}</Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="star" size={13} color="#f4c430" />
                <Text style={styles.cardNote}>{item.note}</Text>
                <Text style={styles.cardPrix}>{item.prix.toLocaleString()}€/j</Text>
              </View>
            </View>
            <View style={styles.btns}>
              <TouchableOpacity style={styles.heartBtn} onPress={() => remove(item.id)}>
                <Ionicons name="heart" size={20} color="#e94560" />
              </TouchableOpacity>
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
  card: { flexDirection: 'row', backgroundColor: '#1a1a2e', borderRadius: 14, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  img: { width: 90, height: 90 },
  cardBody: { flex: 1, padding: 12, justifyContent: 'space-between' },
  cardNom: { color: '#fff', fontWeight: '700', fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardVille: { color: '#aaa', fontSize: 12 },
  cardNote: { color: '#f4c430', fontSize: 12, marginRight: 8 },
  cardPrix: { color: '#e94560', fontSize: 13, fontWeight: '700' },
  btns: { justifyContent: 'center', padding: 12 },
  heartBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(233,69,96,0.15)', justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTxt: { color: '#aaa', fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySub: { color: '#666', fontSize: 14, marginTop: 6, textAlign: 'center' },
});
