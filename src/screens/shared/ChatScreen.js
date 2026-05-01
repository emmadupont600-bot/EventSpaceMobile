import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../theme/colors';

export default function ChatScreen({ route, navigation }) {
  const { venue } = route.params;
  const { user, messages, sendMessage } = useApp();
  const [text, setText] = useState('');
  const flatListRef = useRef();
  const venueMessages = messages[venue.id] || [];

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(venue.id, text.trim(), user.name);
    setText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    if (venueMessages.length % 2 === 0) {
      setTimeout(() => {
        sendMessage(venue.id, 'Bonjour ! Merci pour votre intérêt. Je serais ravi de vous accueillir. N\'hésitez pas à me préciser vos besoins !', venue.annonceurName);
      }, 1200);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{venue.annonceurName.slice(0,2).toUpperCase()}</Text></View>
          <View>
            <Text style={styles.headerName}>{venue.annonceurName}</Text>
            <Text style={styles.headerVenue} numberOfLines={1}>{venue.name}</Text>
          </View>
        </View>
      </View>
      {venueMessages.length === 0 ? (
        <View style={styles.emptyChat}>
          <Ionicons name="chatbubbles-outline" size={56} color={COLORS.textLight} />
          <Text style={styles.emptyChatText}>Démarrez la conversation !</Text>
          <Text style={styles.emptyChatSub}>Présentez votre projet à {venue.annonceurName}</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={venueMessages}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const isMe = item.sender === user.name;
            return (
              <View style={[styles.messageRow, isMe && styles.messageRowRight]}>
                {!isMe && <View style={styles.msgAvatar}><Text style={styles.msgAvatarText}>{item.sender.slice(0,2).toUpperCase()}</Text></View>}
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                  <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.text}</Text>
                  <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>{item.time}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
      <View style={styles.inputBar}>
        <TextInput style={styles.input} placeholder="Écrivez un message..." value={text} onChangeText={setText} multiline placeholderTextColor={COLORS.textLight} />
        <TouchableOpacity style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]} onPress={handleSend} disabled={!text.trim()}>
          <Ionicons name="send" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  headerName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  headerVenue: { fontSize: 12, color: COLORS.textSecondary },
  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyChatText: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptyChatSub: { fontSize: 14, color: COLORS.textSecondary },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  messageRowRight: { flexDirection: 'row-reverse' },
  msgAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  msgAvatarText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  bubble: { maxWidth: '72%', borderRadius: 18, padding: 12, gap: 4 },
  bubbleMe: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: COLORS.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  bubbleText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  bubbleTextMe: { color: COLORS.white },
  bubbleTime: { fontSize: 10, color: COLORS.textLight, alignSelf: 'flex-end' },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.7)' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 10 },
  input: { flex: 1, backgroundColor: COLORS.background, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: COLORS.text, maxHeight: 100, borderWidth: 1, borderColor: COLORS.border },
  sendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6 },
  sendBtnDisabled: { backgroundColor: COLORS.textLight },
});
