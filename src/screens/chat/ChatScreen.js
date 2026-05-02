/**
 * ChatScreen — messagerie temps réel via Supabase Realtime.
 * FIX: import supabase depuis le bon chemin (services/ et non lib/)
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';
import { Store } from '../../utils/store';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

export default function ChatScreen({ route, navigation }) {
  const { conv, venueName, user } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const flatRef = useRef(null);
  const insets = useSafeAreaInsets();
  const channelRef = useRef(null);

  // ── Chargement initial ────────────────────────────────────────────
  const loadMessages = useCallback(async () => {
    const msgs = await Store.getMessages(conv.id);
    setMessages(msgs);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 50);
  }, [conv.id]);

  // ── Supabase Realtime subscription ───────────────────────────────
  useEffect(() => {
    loadMessages();

    // FIX: filtre sur 'conversation_id' (cohérent avec le schema DB)
    const channel = supabase
      .channel(`messages:${conv.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conv.id}`,
        },
        (payload) => {
          const m = payload.new;
          const normalized = { ...m, senderId: m.sender_id };
          setMessages(prev => {
            if (prev.find(x => x.id === m.id)) return prev;
            return [...prev, normalized];
          });
          setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conv.id, loadMessages]);

  // ── Envoi ─────────────────────────────────────────────────────────
  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    try {
      await Store.addMessage(conv.id, {
        senderId: user.id,
        text: trimmed,
      });
    } catch (e) {
      console.error('[Chat] send error:', e);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const isMe = (msg) => String(msg.senderId) === String(user?.id);

  const renderItem = ({ item, index }) => {
    const me = isMe(item);
    const prev = index > 0 ? messages[index - 1] : null;
    const showAvatar = !me && (!prev || String(prev.senderId) !== String(item.senderId));

    return (
      <View style={[styles.msgRow, me ? styles.msgRowMe : styles.msgRowOther]}>
        {!me && (
          <View style={[styles.msgAvatar, !showAvatar && { opacity: 0 }]}>
            <Text style={styles.msgAvatarText}>
              {getInitials(item.senderName || 'A')}
            </Text>
          </View>
        )}
        <View style={[styles.bubble, me ? styles.bubbleMe : styles.bubbleOther]}>
          {!me && showAvatar && (
            <Text style={styles.senderName}>{item.senderName || 'Annonceur'}</Text>
          )}
          <Text style={[styles.bubbleText, me && styles.bubbleTextMe]}>{item.text}</Text>
          <Text style={[styles.bubbleTime, me && styles.bubbleTimeMe]}>{formatTime(item.ts)}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={20} color={colors.dark} />
          </TouchableOpacity>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {getInitials(conv.otherName || venueName || 'A')}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {venueName || conv.venueName || 'Conversation'}
            </Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Temps réel ⚡</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.headerAction}>
            <Feather name="more-vertical" size={20} color={colors.mid} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(item, i) => String(item.id || i)}
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
              <Text style={styles.emptyChatSub}>Les messages arrivent en temps réel</Text>
            </View>
          }
        />

        {/* Barre d'envoi */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
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
            <Feather name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
    ...shadow.xs,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm,
  },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerAvatarText: { color: '#fff', fontWeight: '800', fontSize: typography.small },
  headerInfo: { flex: 1 },
  headerName: { fontSize: typography.body, fontWeight: '800', color: colors.dark },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981' },
  onlineText: { fontSize: typography.tiny, color: '#10B981', fontWeight: '600' },
  headerAction: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  msgList: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, gap: 4 },
  msgRow: { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-end' },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },
  msgAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center',
    marginRight: 8, marginBottom: 2,
  },
  msgAvatarText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  bubble: {
    maxWidth: '75%', borderRadius: 18, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  bubbleMe: {
    backgroundColor: colors.primary, borderBottomRightRadius: 4,
    ...shadow.sm, shadowColor: colors.primary,
  },
  bubbleOther: {
    backgroundColor: colors.white, borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: colors.borderLight, ...shadow.xs,
  },
  senderName: { fontSize: typography.tiny, fontWeight: '700', color: colors.mid, marginBottom: 2 },
  bubbleText: { fontSize: typography.body, color: colors.dark, lineHeight: 20 },
  bubbleTextMe: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: colors.light, marginTop: 2, textAlign: 'right' },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.65)' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm,
    backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.borderLight,
    gap: spacing.sm,
  },
  input: {
    flex: 1, backgroundColor: colors.borderLight,
    borderRadius: radius.xl, paddingHorizontal: spacing.md, paddingVertical: 10,
    fontSize: typography.body, color: colors.dark, maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    ...shadow.sm, shadowColor: colors.primary,
  },
  sendBtnDisabled: { backgroundColor: colors.borderLight, shadowOpacity: 0 },
  emptyChat: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  emptyChatIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyChatText: { fontSize: typography.h3, fontWeight: '700', color: colors.dark },
  emptyChatSub: { fontSize: typography.small, color: colors.light, textAlign: 'center', maxWidth: 220 },
});
