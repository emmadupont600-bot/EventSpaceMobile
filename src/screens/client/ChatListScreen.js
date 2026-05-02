import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { VENUES } from '../../data/venues';
import { COLORS } from '../../theme/colors';

const P = COLORS.primary || '#4F46E5';

export default function ChatListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { messages } = useApp();

  // Construit la liste des conversations à partir des messages
  const conversations = React.useMemo(() => {
    if (!messages || typeof messages !== 'object') return [];
    return Object.entries(messages)
      .map(([venueId, msgs]) => {
        const venue = (VENUES || []).find(v => String(v.id) === String(venueId));
        const last = Array.isArray(msgs) && msgs.length > 0 ? msgs[msgs.length - 1] : null;
        return { venueId, venue, last };
      })
      .filter(c => c.venue && c.last)
      .sort((a, b) => (b.last?.timestamp || 0) - (a.last?.timestamp || 0));
  }, [messages]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {conversations.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{conversations.length}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={conversations}
        keyExtractor={item => item.venueId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Aucun message</Text>
            <Text style={styles.emptySub}>Contactez un annonceur depuis la page d'un lieu.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const name = item.venue?.annonceurName || item.venue?.name || 'Annonceur';
          const initials = name.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2);
          const isMe = item.last?.sender === 'user';
          const preview = item.last?.text || '';

          return (
            <TouchableOpacity
              style={styles.convRow}
              onPress={() => navigation.navigate('Chat', { venue: item.venue })}
              activeOpacity={0.75}
            >
              <View style={[styles.convAvatar, { backgroundColor: P }]}>
                <Text style={styles.convAvatarText}>{initials}</Text>
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.convBody}>
                <View style={styles.convTop}>
                  <Text style={styles.convName} numberOfLines={1}>{name}</Text>
                  <Text style={styles.convTime}>{item.last?.time || ''}</Text>
                </View>
                <Text style={styles.convPreview} numberOfLines={1}>
                  {isMe ? 'Vous : ' : ''}{preview}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', flex: 1 },
  countBadge: {
    backgroundColor: P, borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3, minWidth: 24, alignItems: 'center',
  },
  countBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  list: { paddingVertical: 8, paddingBottom: 100 },
  separator: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 84 },

  convRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, gap: 14,
    backgroundColor: '#fff',
  },
  convAvatar: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  convAvatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#fff',
  },
  convBody: { flex: 1 },
  convTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  convName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  convTime: { fontSize: 11, color: '#94A3B8' },
  convPreview: { fontSize: 13, color: '#94A3B8' },

  empty: { alignItems: 'center', paddingTop: 100, gap: 10, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  emptySub: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },
});
