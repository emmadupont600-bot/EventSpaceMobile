import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store } from '../../utils/store';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

const BOT_REPLIES = [
  'Bonjour ! Je suis disponible à cette date.',
  'Bien sûr, nous pouvons adapter selon vos souhaits.',
  'Pouvez-vous préciser le nombre de personnes prévu ?',
  'Le lieu est libre ce jour-là. Je vous envoie un devis.',
  'Merci pour votre intérêt ! N\'hésitez pas à réserver.',
  'Nous avons aussi un espace extérieur disponible.',
  'Je vous confirme la disponibilité dans les 24h.',
];

export default function ChatScreen({ route, navigation }) {
  const { conv, venueName, user } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const flatRef = useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  const load = async () => {
    const msgs = await Store.getMessages(conv.id);
    setMessages(msgs || []);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 50);
  };

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    // Sécurisé : user.firstName peut être undefined
    const senderName = user?.firstName || user?.name || 'Moi';
    const msg = {
      text: trimmed,
      senderId: user?.id,
      senderName,
      ts: new Date().toISOString(),
    };
    await Store.addMessage(conv.id, msg);
    setText('');
    await load();

    if (user?.role === 'client' || user?.role === 'particulier') {
      setTimeout(async () => {
        const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
        await Store.addMessage(conv.id, {
          text: reply,
          senderId: conv.ownerId || 'annonceur',
          senderName: 'Annonceur',
          ts: new Date().toISOString(),
        });
        await load();
      }, 1200 + Math.random() * 1500);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    try {
      return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  // Sécurisé : name peut être undefined/null
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '?';
    const parts = name.trim().split(' ');
    return parts.map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || '?';
  };

  const isMe = (msg) =>
    msg.senderId === user?.id || msg.senderId === String(user?.id);

  const renderItem = ({ item, index }) => {
    const me = isMe(item);
    const prev = index > 0 ? messages[index - 1] : null;
    const showName = !me && (!prev || prev.senderId !== item.senderId);
    // Sécurisé : item.senderName peut être null
    const senderName = item.senderName || 'Annonceur';

    return (
      <View style={[styles.msgRow, me ? styles.msgRowMe : styles.msgRowOther]}>
        {!me && (
          <View style={[styles.msgAvatar, !showName && styles.msgAvatarHidden]}>
            <Text style={styles.msgAvatarText}>{getInitials(senderName)}</Text>
          </View>
        )}
        <View style={[styles.bubble, me ? styles.bubbleMe : styles.bubbleOther]}>
          {!me && showName && (
            <Text style={styles.senderName}>{senderName}</Text>
          )}
          <Text style={[styles.bubbleText, me && styles.bubbleTextMe]}>{item.text}</Text>
          <Text style={[styles.bubbleTime, me && styles.bubbleTimeMe]}>{formatTime(item.ts)}</Text>
        </View>
      </View>
    );
  };

  // Initiales pour le header — sécurisées
  const headerTitle = venueName || conv?.venueName || 'Conversation';
  const headerInitials = getInitials(conv?.otherName || venueName || 'A');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />

        {/* ─── Header ─── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="arrow-left" size={20} color={colors.dark} />
          </TouchableOpacity>

          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{headerInitials}</Text>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>{headerTitle}</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>En ligne</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.headerAction}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="more-vertical" size={20} color={colors.mid} />
          </TouchableOpacity>
        </View>

        {/* ─── Messages ─── */}
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.msgList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <View style={styles.emptyChatIcon}>
                <Feather name="message-circle" size={28} color={colors.primary} />
              </View>
              <Text style={styles.emptyChatText}>Démarrez la conversation</Text>
              <Text style={styles.emptyChatSub}>Posez vos questions à l'annonceur</Text>
            </View>
          }
        />

        {/* ─── Barre d'envoi ─── */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          <TextInput
            style={styles.input}
            placeholder="Votre message..."
            placeholderTextColor={colors.light}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!text.trim()}
            activeOpacity={0.8}
          >
            <Feather name="send" size={17} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.sm,
    ...shadow.xs,
  },
  backBtn: {
    width: 38, height: 38,
    borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.borderLight,
    flexShrink: 0,
  },
  headerAvatar: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  headerAvatarText: { color: '#fff', fontWeight: '800', fontSize: typography.small },
  headerInfo: { flex: 1, minWidth: 0 },
  headerName: {
    fontSize: typography.body,
    fontWeight: '800',
    color: colors.dark,
    letterSpacing: -0.2,
  },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  onlineDot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  onlineText: { fontSize: typography.tiny, color: colors.success, fontWeight: '600' },
  headerAction: {
    width: 38, height: 38,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  msgList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: 6,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 2,
    alignItems: 'flex-end',
    gap: 6,
  },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },
  msgAvatar: {
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  msgAvatarHidden: { opacity: 0 },
  msgAvatarText: { color: '#fff', fontWeight: '800', fontSize: 10 },

  bubble: {
    maxWidth: '74%',
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 5,
    ...shadow.xs,
    shadowColor: colors.primary,
  },
  bubbleOther: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.xs,
  },
  senderName: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  bubbleText: { fontSize: typography.body, color: colors.dark, lineHeight: 21 },
  bubbleTextMe: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: colors.light, marginTop: 3, textAlign: 'right' },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.6)' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.borderLight,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: typography.body,
    color: colors.dark,
    maxHeight: 110,
    lineHeight: 20,
  },
  sendBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.sm,
    shadowColor: colors.primary,
    flexShrink: 0,
  },
  sendBtnDisabled: { backgroundColor: colors.border, shadowOpacity: 0 },

  emptyChat: {
    alignItems: 'center',
    paddingTop: 80,
    gap: spacing.md,
  },
  emptyChatIcon: {
    width: 64, height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyChatText: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: colors.dark,
  },
  emptyChatSub: {
    fontSize: typography.small,
    color: colors.light,
    textAlign: 'center',
    maxWidth: 220,
    lineHeight: 20,
  },
});
