import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { Store } from '../../utils/store';
import { colors, spacing, typography, radius } from '../../theme/colors';

export default function ChatScreen({ route, navigation }) {
  const { conv, venueName, user } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const flatRef = useRef(null);

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  const load = async () => {
    const msgs = await Store.getMessages(conv.id);
    setMessages(msgs);
  };

  const send = async () => {
    if (!text.trim()) return;
    const msg = { text: text.trim(), senderId: user.id, senderName: user.firstName };
    await Store.addMessage(conv.id, msg);
    setText('');
    await load();
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);

    // Bot réponse (simulation annonceur)
    if (user.role === 'particulier') {
      setTimeout(async () => {
        const replies = [
          'Bonjour ! Je suis disponible à cette date, n\'hésitez pas à réserver.',
          'Bien sûr, nous pouvons adapter la décoration selon vos souhaits.',
          'Parfait ! Pouvez-vous préciser le nombre de personnes prévu ?',
          'Le lieu est libre ce jour-là. Je vous envoie un devis dès que possible.',
        ];
        const r = replies[Math.floor(Math.random() * replies.length)];
        await Store.addMessage(conv.id, { text: r, senderId: conv.ownerId, senderName: 'Annonceur' });
        await load();
      }, 1500 + Math.random() * 1000);
    }
  };

  const isMe = (msg) => msg.senderId === user.id;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
      <Header title={venueName} subtitle="Chat avec l'annonceur" onBack={() => navigation.goBack()} />
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={m => String(m.id)}
        style={{ backgroundColor: colors.bg }}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
        onContentSizeChange={() => flatRef.current?.scrollToEnd()}
        renderItem={({ item }) => {
          const me = isMe(item);
          return (
            <View style={[styles.msgRow, me ? styles.msgRowMe : styles.msgRowThem]}>
              {!me && (
                <View style={styles.avatar}>
                  <Text style={styles.avatarTxt}>{item.senderName?.[0] || 'A'}</Text>
                </View>
              )}
              <View style={[styles.bubble, me ? styles.bubbleMe : styles.bubbleThem]}>
                {!me && <Text style={styles.senderName}>{item.senderName}</Text>}
                <Text style={[styles.msgTxt, me && styles.msgTxtMe]}>{item.text}</Text>
                <Text style={[styles.ts, me && styles.tsMe]}>{item.ts ? new Date(item.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={40} color={colors.light} />
            <Text style={styles.emptyTxt}>Démarrez la conversation !</Text>
            <Text style={styles.emptySub}>Posez vos questions à l'annonceur directement.</Text>
          </View>
        }
      />
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Écrire un message..."
          placeholderTextColor={colors.light}
          multiline
          onSubmitEditing={send}
        />
        <TouchableOpacity style={[styles.sendBtn, !text.trim() && { opacity: 0.4 }]} onPress={send} disabled={!text.trim()}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', maxWidth: '80%' },
  msgRowMe: { alignSelf: 'flex-end' },
  msgRowThem: { alignSelf: 'flex-start', gap: 8 },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.mid, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },
  bubble: { borderRadius: 16, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, maxWidth: '100%' },
  bubbleMe: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: colors.white, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  senderName: { fontSize: typography.tiny, fontWeight: '700', color: colors.primary, marginBottom: 2 },
  msgTxt: { fontSize: typography.body, color: colors.dark, lineHeight: 20 },
  msgTxtMe: { color: '#fff' },
  ts: { fontSize: typography.tiny, color: colors.mid, marginTop: 3, textAlign: 'right' },
  tsMe: { color: 'rgba(255,255,255,0.7)' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: spacing.sm },
  emptyTxt: { fontSize: typography.h3, fontWeight: '700', color: colors.mid },
  emptySub: { fontSize: typography.small, color: colors.light, textAlign: 'center' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: spacing.md, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
  input: { flex: 1, backgroundColor: colors.bg, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.body, color: colors.dark, maxHeight: 100, borderWidth: 1, borderColor: colors.border },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
