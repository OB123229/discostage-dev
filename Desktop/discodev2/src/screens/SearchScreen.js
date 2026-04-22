import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { ARTISTS, EVENTS } from '../data/mockData';

function ArtistItem({ artist }) {
  const [following, setFollowing] = useState(false);
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.8}>
      <View style={[styles.avatar, { backgroundColor: artist.color }]}>
        <Text style={styles.avatarText}>{artist.name[0]}</Text>
      </View>
      <View style={styles.rowMeta}>
        <Text style={styles.rowTitle}>{artist.name}</Text>
        <Text style={styles.rowSub}>
          {artist.genre} · {artist.followers.toLocaleString()} fans
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.followBtn, following && styles.followBtnActive]}
        onPress={() => setFollowing(!following)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.followBtnText, following && styles.followBtnTextActive]}>
          {following ? '✓' : '+'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function EventItem({ event }) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.8}>
      <View style={[styles.colorBar, { backgroundColor: event.color }]} />
      <View style={styles.rowMeta}>
        <Text style={styles.rowTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={[styles.rowSub, { color: colors.primaryLight }]}>
          {event.artist} · {event.date}
        </Text>
        <Text style={styles.rowSubMuted} numberOfLines={1}>
          {event.venue}, {event.area}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('artists');

  const q = query.toLowerCase();
  const filteredArtists = ARTISTS.filter(
    (a) => a.name.toLowerCase().includes(q) || a.genre.toLowerCase().includes(q)
  );
  const filteredEvents = EVENTS.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.artist.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q)
  );

  const data = tab === 'artists' ? filteredArtists : filteredEvents;

  return (
    <LinearGradient colors={['#1a0533', '#140329']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.headerTitle}>Search</Text>

        {/* Search input */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={tab === 'artists' ? 'Search artists...' : 'Search events...'}
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {['artists', 'events'].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'artists' ? 'Artists' : 'Events'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results */}
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) =>
            tab === 'artists' ? (
              <ArtistItem artist={item} />
            ) : (
              <EventItem event={item} />
            )
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={52} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                {query ? 'No results found' : `Browse ${tab} above`}
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 20 },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    paddingTop: 6,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  searchInput: { flex: 1, paddingVertical: 14, color: colors.white, fontSize: 16 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: colors.white },
  list: { paddingBottom: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: colors.white, fontSize: 22, fontWeight: '700' },
  colorBar: { width: 4, height: 52, borderRadius: 2, marginRight: 14 },
  rowMeta: { flex: 1 },
  rowTitle: { color: colors.white, fontSize: 16, fontWeight: '600' },
  rowSub: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  rowSubMuted: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  followBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followBtnActive: {
    backgroundColor: 'rgba(123,47,190,0.25)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followBtnText: { color: colors.white, fontSize: 20, fontWeight: '700', lineHeight: 22 },
  followBtnTextActive: { color: colors.primaryLight, fontSize: 16 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 14 },
  emptyText: { color: colors.textMuted, fontSize: 16 },
});
