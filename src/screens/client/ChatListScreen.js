import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MESSAGES } from '../../data/mockData';

export default function ChatListScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <View style={styles.badge}><Text style={styles.badgeTxt}>{MESSAGES.length}</Text></View>
      </View>
      <FlatList
        data={MESSAGES}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={64} color="#444" />
            <Text style={styles.emptyTxt}>Aucun message</Text>
            <Text style={styles.emptySub}>Contactez un annonceur depuis un lieu</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Chat', { conversation: item })}>
            <View style={styles.avatar}><Ionicons name="person" size={22} color="#e94560" /></View>
            <View style={styles.itemBody}>
              <View style={styles.itemTop}>
                <Text style={styles.itemNom}>{item.annonceurNom}</Text>
                <Text style={styles.itemHeure}>{item.heure}</Text>
              </View>
              <Text style={styles.itemLieu}>{item.lieuNom}</Text>
              <Text style={styles.itemDernier} numberOfLines={1}>{item.dernier}</Text>
            </View>
            {item.nonLus > 0 && <View style={styles.nonLus}><Text style={styles.nonLusTxt}>{item.nonLus}</Text></View>}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0c29' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 10 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  badge: { backgroundColor: '#e94560', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(233,69,96,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemBody: { flex: 1 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  itemNom: { color: '#fff', fontWeight: '700', fontSize: 15 },
  itemHeure: { color: '#666', fontSize: 12 },
  itemLieu: { color: '#e94560', fontSize: 12, marginBottom: 3 },
  itemDernier: { color: '#aaa', fontSize: 13 },
  nonLus: { backgroundColor: '#e94560', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  nonLusTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTxt: { color: '#aaa', fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySub: { color: '#666', fontSize: 14, marginTop: 6, textAlign: 'center' },
});
