import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen({ navigation, route }) {
  const { conversation, lieu } = route.params;
  const conv = conversation || { lieuNom: lieu?.nom, annonceurNom: lieu?.annonceur?.nom, messages: [] };
  const [messages, setMessages] = useState(conv.messages || []);
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), text: text.trim(), from: 'client', heure: new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }) }]);
    setText('');
    setTimeout(() => {
      setMessages(m => [...m, { id: (Date.now() + 1).toString(), text: 'Merci pour votre message ! Je vous réponds dès que possible.', from: 'annonceur', heure: new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatar}><Ionicons name="person" size={18} color="#e94560" /></View>
          <View>
            <Text style={styles.headerNom}>{conv.annonceurNom}</Text>
            <Text style={styles.headerSub}>{conv.lieuNom}</Text>
          </View>
        </View>
        <Ionicons name="call-outline" size={22} color="#e94560" />
      </View>

      <FlatList
        data={messages}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyTxt}>Commencez la conversation !</Text>}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.from === 'client' ? styles.bubbleClient : styles.bubbleAnnonceur]}>
            <Text style={[styles.bubbleTxt, item.from === 'client' ? styles.bubbleTxtClient : styles.bubbleTxtAnnonceur]}>{item.text}</Text>
            <Text style={styles.bubbleHeure}>{item.heure}</Text>
          </View>
        )}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Votre message..."
            placeholderTextColor="#666"
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]} onPress={send} disabled={!text.trim()}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0c29' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', gap: 12 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(233,69,96,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerNom: { color: '#fff', fontWeight: '700', fontSize: 15 },
  headerSub: { color: '#aaa', fontSize: 12 },
  list: { padding: 16, paddingBottom: 8 },
  bubble: { maxWidth: '78%', borderRadius: 16, padding: 12, marginBottom: 8 },
  bubbleClient: { alignSelf: 'flex-end', backgroundColor: '#e94560', borderBottomRightRadius: 4 },
  bubbleAnnonceur: { alignSelf: 'flex-start', backgroundColor: '#1a1a2e', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  bubbleTxt: { fontSize: 15, lineHeight: 21 },
  bubbleTxtClient: { color: '#fff' },
  bubbleTxtAnnonceur: { color: '#ddd' },
  bubbleHeure: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4, alignSelf: 'flex-end' },
  emptyTxt: { textAlign: 'center', color: '#666', marginTop: 40, fontSize: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 10, backgroundColor: '#1a1a2e', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#fff', fontSize: 15, maxHeight: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e94560', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#555' },
});
