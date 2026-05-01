import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  StatusBar, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Store } from '../../utils/store';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

export default function ConversationsScreen({ navigation }) {
  const [convs, setConvs] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const insets = useSafeAreaInsets();

  useFocusEffect(useCallback(() => { load(); }, []));

  const load = async () => {
    const u = await Store.getCurrentUser();
    setUser(u);
    if (!u) return;
    const keys = await AsyncStorage.getAllKeys();
    const convKeys = keys.filter(k => k.startsWith('es_conv_' + u.id + '_'));
    const results = await Promise.all(
      convKeys.map(async key => {
        const raw = await AsyncStorage.getItem(key);
        const conv = JSON.parse(raw);
        const msgs = await Store.getMessages(conv.id);
        const last = msgs[msgs.length - 1] || null;
        return {
          ...conv,
          lastMsg: last,
          unread: msgs.filter(m => m.senderId !== u.id && !m.read).length,
        };
      })
    );
    results.sort((a, b) => {
      const ta = a.lastMsg?.ts || '0';
      const tb = b.lastMsg?.ts || '0';
      return tb.localeCompare(ta);
    });
    setConvs(results);
  };

  const filtered = convs.filter(c =>
    !search ||
    (c.venueName || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.otherName || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString())
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const AVATAR_COLORS = ['#4F46E5','#EC4899','#10B981','#F59E0B','#8B5CF6','#3B82F6'];
  const avatarColor = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        {convs.some(c => c.unread > 0) && (
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>
              {convs.reduce((acc, c) => acc + c.unread, 0)}
            </Text>
          </View>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Feather name="search" size={16} color={colors.mid} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une conversation..."
          placeholderTextColor={colors.light}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={c => c.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.convItem}
            onPress={() => navigation.navigate('ChatRoom', { conv: item, venueName: item.venueName, user })}
            activeOpacity={0.75}
          >
            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: avatarColor(item.id?.charCodeAt(0)) }]}>
              <Text style={styles.avatarText}>{getInitials(item.otherName || item.venueName)}</Text>
              <View style={styles.onlineDot} />
            </View>
            {/* Contenu */}
            <View style={styles.convContent}>
              <View style={styles.convTop}>
                <Text style={styles.convName} numberOfLines={1}>
                  {item.venueName || 'Conversation'}
                </Text>
                <Text style={styles.convTime}>{formatTime(item.lastMsg?.ts)}</Text>
              </View>
              <View style={styles.convBottom}>
                <Text style={styles.convPreview} numberOfLines={1}>
                  {item.lastMsg?.text || 'Démarrez la conversation'}
                </Text>
                {item.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Feather name="message-circle" size={32} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Aucun message</Text>
            <Text style={styles.emptySub}>Contactez un annonceur depuis une fiche lieu</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  title: { fontSize: typography.h1, fontWeight: '900', color: colors.dark, flex: 1, letterSpacing: -0.5 },
  totalBadge: {
    backgroundColor: colors.secondary, borderRadius: radius.full,
    minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  totalBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, marginHorizontal: spacing.lg, marginBottom: spacing.md,
    borderRadius: radius.xl, paddingHorizontal: spacing.md, paddingVertical: 10,
    borderWidth: 1.5, borderColor: colors.border, gap: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: typography.body, color: colors.dark },
  separator: { height: 1, backgroundColor: colors.borderLight, marginLeft: 80 },
  convItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
    position: 'relative',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: typography.body },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2, borderColor: colors.white,
  },
  convContent: { flex: 1 },
  convTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  convName: { fontSize: typography.body, fontWeight: '700', color: colors.dark, flex: 1, marginRight: spacing.sm },
  convTime: { fontSize: typography.tiny, color: colors.light },
  convBottom: { flexDirection: 'row', alignItems: 'center' },
  convPreview: { fontSize: typography.small, color: colors.mid, flex: 1 },
  unreadBadge: {
    backgroundColor: colors.primary, borderRadius: radius.full,
    minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: { fontSize: typography.h3, fontWeight: '700', color: colors.dark },
  emptySub: { fontSize: typography.small, color: colors.light, textAlign: 'center', maxWidth: 240 },
});
