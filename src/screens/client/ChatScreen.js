import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  SafeAreaView, StatusBar, Image,
} from 'react-native';
import { COLORS } from '../../theme/colors';

const DEMO_MESSAGES = [
  { id: '1', text: 'Bonjour ! Je suis intéressé par votre lieu pour un événement.', sender: 'me', time: '10:20' },
  { id: '2', text: 'Bonjour ! Avec plaisir, quelle est la date prévue ?', sender: 'other', time: '10:22' },
  { id: '3', text: 'Ce serait pour le 15 juin, environ 50 personnes.', sender: 'me', time: '10:24' },
  { id: '4', text: 'Parfait, le lieu est disponible ce jour-là ! Je vous envoie les détails et le contrat. 😊', sender: 'other', time: '10:25' },
];

export default function ChatScreen({ route, navigation }) {
  const { venue } = route.params || {};
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [text, setText] = useState('');
  const flatRef = useRef(null);

  const senderName = venue?.annonceurName || 'Annonceur';
  const senderAvatar = venue?.annonceurAvatar || null;
  const senderInitials = senderName
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const newMsg = {
      id: String(Date.now()),
      text: text.trim(),
      sender: 'me',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMsg]);
    setText('');
    // Simule une réponse automatique
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: String(Date.now() + 1),
        text: 'Merci pour votre message, je reviens vers vous rapidement ! 👍',
        sender: 'other',
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header avec avatar + statut en ligne */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.avatarContainer}>
          {senderAvatar ? (
            <Image source={{ uri: senderAvatar }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarFallback}>
              <Text style={styles.headerAvatarInitials}>{senderInitials}</Text>
            </View>
          )}
          <View style={styles.onlineDot} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName}>{senderName}</Text>
          <Text style={styles.onlineStatus}>● En ligne</Text>
        </View>
        <TouchableOpacity style={styles.callBtn}>
          <Text style={styles.callIcon}>📞</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[
              styles.bubble,
              item.sender === 'me' ? styles.bubbleMe : styles.bubbleOther,
            ]}>
              <Text style={[
                styles.bubbleText,
                item.sender === 'me' ? styles.bubbleTextMe : styles.bubbleTextOther,
              ]}>{item.text}</Text>
              <Text style={[
                styles.bubbleTime,
                item.sender === 'me' ? styles.bubbleTimeMe : styles.bubbleTimeOther,
              ]}>{item.time}</Text>
            </View>
          )}
        />

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Votre message..."
            placeholderTextColor="#94A3B8"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!text.trim()}
            activeOpacity={0.85}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const P = COLORS.primary || '#4F46E5';
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0', gap: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 18, color: '#0F172A' },
  avatarContainer: { position: 'relative' },
  headerAvatar: { width: 42, height: 42, borderRadius: 21 },
  headerAvatarFallback: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: P, alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarInitials: { color: '#fff', fontWeight: '700', fontSize: 15 },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#fff',
  },
  headerName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  onlineStatus: { fontSize: 11, color: '#22C55E', fontWeight: '600', marginTop: 1 },
  callBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center' },
  callIcon: { fontSize: 18 },
  messagesList: { padding: 16, gap: 8 },
  bubble: {
    maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 4,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: P,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  bubbleTextMe: { color: '#fff' },
  bubbleTextOther: { color: '#0F172A' },
  bubbleTime: { fontSize: 10, marginTop: 4 },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.65)', textAlign: 'right' },
  bubbleTimeOther: { color: '#94A3B8' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 12, paddingBottom: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#E2E8F0', gap: 10,
  },
  input: {
    flex: 1, backgroundColor: '#F1F5F9',
    borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, color: '#0F172A', maxHeight: 100,
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: P, alignItems: 'center', justifyContent: 'center',
    shadowColor: P, shadowOpacity: 0.35, shadowRadius: 6, elevation: 4,
  },
  sendBtnDisabled: { backgroundColor: '#CBD5E1', shadowOpacity: 0 },
  sendIcon: { color: '#fff', fontSize: 18 },
});
