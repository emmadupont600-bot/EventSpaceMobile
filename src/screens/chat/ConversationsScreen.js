import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store } from '../../utils/store';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'maintenant';
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}j`;
}

export default function ConversationsScreen({ navigation }) {
  const [convs, setConvs] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useFocusEffect(useCallback(() => {
    (async () => {
      setLoading(true);
      const u = await Store.getCurrentUser();
      setUser(u);
      if (!u) { setConvs([]); setLoading(false); return; }
      const list = await Store.getAllConversations(u.id);
      // Enrichit chaque conv avec le dernier message
      const enriched = await Promise.all(
        (list || []).map(async (c) => {
          const msgs = await Store.getMessages(c.id);
          const last = msgs && msgs.length > 0 ? msgs[msgs.length - 1] : null;
          return { ...c, lastMsg: last };
        })
      );
      setConvs(enriched.sort((a, b) => {
        const ta = a.lastMsg?.ts || 0;
        const tb = b.lastMsg?.ts || 0;
        return new Date(tb) - new Date(ta);
      }));
      setLoading(false);
    })();
  }, []));

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderItem = ({ item }) => {
    const otherName = user?.id === item.userId ? (item.ownerName || 'Annonceur') : (item.userName || 'Client');
    const initials = getInitials(otherName);
    const unread = item.lastMsg && !item.lastMsg.read && item.lastMsg.senderId !== user?.id;

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('ChatRoom', { conv: item, venueName: item.venueName, user })}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initials}</Text>
          </View>
          <View style={styles.onlineDot} />
        </View>

        {/* Contenu */}
        <View style={styles.itemContent}>
          <View style={styles.itemTop}>
            <Text style={[styles.itemName, unread && styles.itemNameBold]} numberOfLines={1}>{otherName}</Text>
            <Text style={styles.itemTime}>{timeAgo(item.lastMsg?.ts)}</Text>
          </View>
          <Text style={styles.itemVenue} numberOfLines={1}>🏛️ {item.venueName}</Text>
          <Text style={[styles.itemPreview, unread && styles.itemPreviewBold]} numberOfLines={1}>
            {item.lastMsg ? item.lastMsg.text : 'Nouvelle conversation'}
          </Text>
        </View>

        {/* Badge non-lu */}
        {unread && <View style={styles.unreadBadge} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.titleEmoji}>💬</Text>
        <Text style={styles.title}>Messages</Text>
        {convs.length > 0 && (
          <View style={styles.badge}><Text style={styles.badgeTxt}>{convs.length}</Text></View>
        )}
      </View>

      <FlatList
        data={convs}
        keyExtractor={c => String(c.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIco}>💬</Text>
              <Text style={styles.emptyTitle}>Aucun message</Text>
              <Text style={styles.emptySub}>Vos conversations apparaîtront ici</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  titleEmoji: { fontSize: 22 },
  title: { fontSize: typography.h1, fontWeight: '900', color: colors.dark, flex: 1, letterSpacing: -0.5 },
  badge: {
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  badgeTxt: { fontSize: typography.small, fontWeight: '800', color: colors.primary },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white, gap: spacing.md,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2, borderColor: colors.white,
  },
  itemContent: { flex: 1 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  itemName: { fontSize: typography.body, fontWeight: '600', color: colors.dark },
  itemNameBold: { fontWeight: '900' },
  itemVenue: { fontSize: typography.tiny, color: colors.mid, marginBottom: 2 },
  itemPreview: { fontSize: typography.small, color: colors.mid },
  itemPreviewBold: { color: colors.dark, fontWeight: '700' },
  itemTime: { fontSize: typography.tiny, color: colors.light },
  unreadBadge: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.primary,
  },
  separator: { height: 1, backgroundColor: colors.borderLight, marginLeft: 82 },
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  emptyIco: { fontSize: 48 },
  emptyTitle: { fontSize: typography.h3, fontWeight: '700', color: colors.dark },
  emptySub: { fontSize: typography.small, color: colors.light, textAlign: 'center' },
});
