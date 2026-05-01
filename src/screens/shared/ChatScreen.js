import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../theme/colors';

export default function ChatScreen({ route, navigation }) {
  const { venue } = route.params;
  const { user, messages, sendMessage } = useApp();
  const [text, setText] = useState('');
  const flatListRef = useRef();
  const venueMessages = messages?.[venue?.id] || [];
  const annonceurName = venue?.annonceurName || 'Annonceur';
  const avatarInitials = annonceurName.slice(0, 2).toUpperCase();

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(venue.id, text.trim(), user?.name || 'Moi');
    setText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    if (venueMessages.length % 2 === 0) {
      setTimeout(() => {
        sendMessage(venue.id, 'Bonjour ! Merci pour votre intérêt. Je serais ravi de vous accueillir. N\'hésitez pas à me préciser vos besoins !', annonceurName);
      }, 1200);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
      {/* Header */}
      <SafeAreaView style={styles.headerWrap}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarInitials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerName} numberOfLines={1}>{annonceurName}</Text>
              <Text style={styles.headerVenue} numberOfLines={1}>{venue?.name || ''}</Text>
            </View>
          </View>
          <View style={styles.onlineDot} />
        </View>
      </SafeAreaView>

      {/* Messages */}
      {venueMessages.length === 0 ? (
        <View style={styles.emptyChat}>
          <View style={styles.emptyChatIcon}>
            <Ionicons name="chatbubbles-outline" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyChatText}>Démarrez la conversation</Text>
          <Text style={styles.emptyChatSub}>Présentez votre projet à {annonceurName}</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={venueMessages}
          keyExtractor={item => item.id || String(Math.random())}
          contentContainerStyle={styles.msgList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const senderName = item.sender || '';
            const isMe = senderName === (user?.name || '');
            const initials = senderName ? senderName.slice(0, 2).toUpperCase() : '?';
            return (
              <View style={[styles.messageRow, isMe && styles.messageRowRight]}>
                {!isMe && (
                  <View style={styles.msgAvatar}>
                    <Text style={styles.msgAvatarText}>{initials}</Text>
                  </View>
                )}
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                  <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.text || ''}</Text>
                  <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>{item.time || ''}</Text>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Écrivez un message..."
          value={text}
          onChangeText={setText}
          multiline
          placeholderTextColor={COLORS.textLight}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F8' },
  headerWrap: { backgroundColor: COLORS.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center',
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  headerName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  headerVenue: { fontSize: 12, color: COLORS.textSecondary },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32 },
  emptyChatIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  emptyChatText: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptyChatSub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  msgList: { padding: 16, gap: 10, paddingBottom: 24 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 4 },
  messageRowRight: { flexDirection: 'row-reverse' },
  msgAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  msgAvatarText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  bubble: { maxWidth: '74%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 2 },
  bubbleMe: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleOther: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  bubbleText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  bubbleTextMe: { color: COLORS.white },
  bubbleTime: { fontSize: 10, color: COLORS.textLight, alignSelf: 'flex-end', marginTop: 2 },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.6)' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F2F8',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 6,
  },
  sendBtnDisabled: { backgroundColor: COLORS.textLight, shadowOpacity: 0 },
});
