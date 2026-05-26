import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store } from '../../utils/store';
import { useApp } from '../../context/AppContext';
import { ChatItemSkeleton } from '../../components/SkeletonLoader';
import { colors, spacing, radius, shadow } from '../../theme/colors';

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
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { user } = useApp();

  useFocusEffect(useCallback(() => {
    (async () => {
      setLoading(true);
      if (!user) { setConvs([]); setLoading(false); return; }
      try {
        const list = await Store.getAllConversations(user.id);
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
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]));

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderItem = ({ item }) => {
    const otherName = user?.id === item.user_id
      ? (item.ownerName || 'Annonceur')
      : (item.userName || 'Client');
    const initials = getInitials(otherName);
    const unread = item.lastMsg && !item.lastMsg.read && item.lastMsg.sender_id !== user?.id;

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('ChatRoom', { conv: item, venueName: item.venue_name || item.venueName, user })}
        activeOpacity={0.7}
      >
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initials}</Text>
          </View>
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.itemContent}>
          <View style={styles.itemTop}>
            <Text style={[styles.itemName, unread && styles.itemNameBold]} numberOfLines={1}>{otherName}</Text>
            <Text style={styles.itemTime}>{timeAgo(item.lastMsg?.ts)}</Text>
          </View>
          <Text style={styles.itemVenue} numberOfLines={1}>
            <Ionicons name="location-outline" size={11} color={colors.textSecondary} /> {item.venue_name || item.venueName}
          </Text>
          <Text style={[styles.itemPreview, unread && styles.itemPreviewBold]} numberOfLines={1}>
            {item.lastMsg ? item.lastMsg.text : 'Nouvelle conversation'}
          </Text>
        </View>

        {unread && <View style={styles.unreadBadge} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>
            {loading ? '…' : convs.length === 0 ? 'Aucune conversation' : `${convs.length} conversation${convs.length > 1 ? 's' : ''}`}
          </Text>
        </View>
      </View>

      {loading ? (
        <View>
          {[1, 2, 3, 4].map(i => <ChatItemSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={convs}
          keyExtractor={c => String(c.id)}
          renderItem={renderItem}
          contentContainerStyle={[{ paddingBottom: 100 }, convs.length === 0 && { flex: 1 }]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcoBox}>
                <Ionicons name="chatbubbles-outline" size={36} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Aucun message</Text>
              <Text style={styles.emptySub}>Vos conversations avec les annonceurs apparaîtront ici</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md,
  },
  title: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.surface, gap: spacing.md,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.xs,
  },
  avatarTxt: { color: '#fff', fontWeight: '900', fontSize: 16 },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2, borderColor: colors.surface,
  },
  itemContent: { flex: 1 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  itemName: { fontSize: 15, fontWeight: '700', color: colors.text },
  itemNameBold: { fontWeight: '900' },
  itemVenue: { fontSize: 11, color: colors.textSecondary, marginBottom: 2 },
  itemPreview: { fontSize: 13, color: colors.textSecondary },
  itemPreviewBold: { color: colors.text, fontWeight: '700' },
  itemTime: { fontSize: 11, color: colors.textLight },
  unreadBadge: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.primary,
  },
  separator: { height: 1, backgroundColor: colors.borderLight, marginLeft: 82 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.xl },
  emptyIcoBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', maxWidth: 260 },
});
