import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, FlatList, Dimensions, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function DetailScreen({ navigation, route }) {
  const { lieu } = route.params;
  const [favori, setFavori] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imgContainer}>
          <FlatList
            data={lieu.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            onMomentumScrollEnd={e => setImgIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => <Image source={{ uri: item }} style={styles.img} />}
          />
          <View style={styles.dots}>
            {lieu.images.map((_, i) => <View key={i} style={[styles.dot, i === imgIndex && styles.dotActive]} />)}
          </View>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favBtn} onPress={() => setFavori(!favori)}>
            <Ionicons name={favori ? 'heart' : 'heart-outline'} size={22} color={favori ? '#e94560' : '#fff'} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <View style={styles.row}>
            <Text style={styles.nom}>{lieu.nom}</Text>
            <View style={styles.noteBox}>
              <Ionicons name="star" size={14} color="#f4c430" />
              <Text style={styles.note}>{lieu.note}</Text>
              <Text style={styles.noteAvis}> ({lieu.avis})</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#aaa" />
            <Text style={styles.infoTxt}>{lieu.adresse}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color="#aaa" />
            <Text style={styles.infoTxt}>Jusqu'à {lieu.capacite} personnes</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="home-outline" size={16} color="#aaa" />
            <Text style={styles.infoTxt}>{lieu.type}</Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.desc}>{lieu.description}</Text>

          <Text style={styles.sectionTitle}>Équipements</Text>
          <View style={styles.equipGrid}>
            {lieu.equipements.map((e, i) => (
              <View key={i} style={styles.equipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#e94560" />
                <Text style={styles.equipTxt}>{e}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Annonceur</Text>
          <View style={styles.annonceurCard}>
            <View style={styles.annonceurAvatar}>
              <Ionicons name="person" size={24} color="#e94560" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.annonceurNom}>{lieu.annonceur.nom}</Text>
              <Text style={styles.annonceurSub}>Annonceur vérifié ✓</Text>
            </View>
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => navigation.navigate('Messages', { screen: 'Chat', params: { lieu } })}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#e94560" />
              <Text style={styles.chatTxt}>Contacter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerPrix}>{lieu.prix.toLocaleString()}€<Text style={styles.footerSub}>/jour</Text></Text>
          <Text style={styles.footerTaxe}>Commission 12% incluse</Text>
        </View>
        <TouchableOpacity style={styles.reservBtn} onPress={() => navigation.navigate('Reservation', { lieu })}>
          <Text style={styles.reservTxt}>Réserver maintenant</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0c29' },
  imgContainer: { position: 'relative' },
  img: { width, height: 280 },
  dots: { position: 'absolute', bottom: 12, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff', width: 18 },
  backBtn: { position: 'absolute', top: 16, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  favBtn: { position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  body: { padding: 20, paddingBottom: 100 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  nom: { fontSize: 22, fontWeight: '800', color: '#fff', flex: 1, marginRight: 10 },
  noteBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(244,196,48,0.1)', borderRadius: 8, padding: 6 },
  note: { color: '#f4c430', fontWeight: '700', fontSize: 14, marginLeft: 4 },
  noteAvis: { color: '#aaa', fontSize: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoTxt: { color: '#aaa', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginTop: 20, marginBottom: 10 },
  desc: { color: '#bbb', fontSize: 14, lineHeight: 22 },
  equipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  equipItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(233,69,96,0.1)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(233,69,96,0.3)' },
  equipTxt: { color: '#ddd', fontSize: 13 },
  annonceurCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  annonceurAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(233,69,96,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  annonceurNom: { color: '#fff', fontWeight: '700', fontSize: 15 },
  annonceurSub: { color: '#4CAF50', fontSize: 12, marginTop: 2 },
  chatBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#e94560', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  chatTxt: { color: '#e94560', fontWeight: '600', fontSize: 13 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1a1a2e', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  footerPrix: { fontSize: 24, fontWeight: '800', color: '#e94560' },
  footerSub: { fontSize: 14, fontWeight: '400', color: '#aaa' },
  footerTaxe: { color: '#666', fontSize: 11, marginTop: 2 },
  reservBtn: { backgroundColor: '#e94560', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 14, shadowColor: '#e94560', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  reservTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
