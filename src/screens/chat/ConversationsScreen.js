import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';
import { Store } from '../../utils/store';

export default function ConversationsScreen({ navigation }) {
  const [convs, setConvs] = useState([]);
  const [user, setUser] = useState(null);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const load = async () => {
    const u = await Store.getCurrentUser();
    setUser(u);
    if (!u) return;
    // Récupère toutes les clés AsyncStorage qui correspondent à des conversations
    const keys = await AsyncStorage.getAllKeys();
    const convKeys = keys.filter(k => k.startsWith('es_conv_' + u.id + '_'));
    const results = await Promise.all(
      convKeys.map(async key => {
        const raw = await AsyncStorage.getItem(key);
        const conv = JSON.parse(raw);
        const msgs = await Store.getMessages(conv.id);
        const last = msgs[msgs.length - 1] || null;
        return { ...conv, lastMsg: last, unread: msgs.filter(m => m.senderId !== u.id && !m.read).length };
      })
    );
    results.sort((a, b) => {
      const ta = a.lastMsg?.ts || '0';
      const tb = b.lastMsg?.ts || '0';
      return tb.localeCompare(ta);
    });
    setConvs(results);
  };

  const openChat = (conv) => {
    navigation.navigate('Chat', { conv, venueName: conv.venueName, user });
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Messages" subtitle={`${convs.length} conversation${convs.length !== 1 ? 's' : ''}`} />
      <FlatList
        data={convs}
        keyExtractor={c => String(c.id)}
        contentContainerStyle={convs.length === 0 && styles.emptyContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => openChat(item)} activeOpacity={0.7}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarTxt}>{item.venueName?.[0] || '?'}</Text>
              {item.unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeTxt}>{item.unread}</Text>
                </View>
              )}
            </View>
            <View style={styles.info}>
              <View style={styles.rowTop}>
                <Text style={[styles.venueName, item.unread > 0 && styles.bold]} numberOfLines={1}>{item.venueName}</Text>
                <Text style={styles.time}>{formatTime(item.lastMsg?.ts)}</Text>
              </View>
              <Text style={[styles.preview, item.unread > 0 && styles.previewBold]} numberOfLines={1}>
                {item.lastMsg ? (item.lastMsg.senderId === user?.id ? 'Vous : ' : '') + item.lastMsg.text : 'Aucun message'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.light} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={52} color={colors.light} />
            <Text style={styles.emptyTitle}>Aucune conversation</Text>
            <Text style={styles.emptySub}>Contactez un annonceur depuis la fiche d'un lieu pour démarrer.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 80 },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.white, gap: spacing.md },
  avatarWrap: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarTxt: { color: colors.primary, fontWeight: '800', fontSize: 20 },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: colors.danger || '#e53e3e', borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: '800' },
  info: { flex: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  venueName: { fontSize: typography.body, color: colors.dark, fontWeight: '600', flex: 1 },
  bold: { fontWeight: '800', color: colors.dark },
  time: { fontSize: typography.tiny, color: colors.light, marginLeft: spacing.sm },
  preview: { fontSize: typography.small, color: colors.mid },
  previewBold: { color: colors.dark, fontWeight: '600' },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: typography.h3, fontWeight: '700', color: colors.mid },
  emptySub: { fontSize: typography.small, color: colors.light, textAlign: 'center', lineHeight: 20 },
});
