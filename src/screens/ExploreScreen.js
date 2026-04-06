import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { ARTISTS, GENRES } from '../data/mockData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.62;

function ArtistCard({ artist }) {
  const [following, setFollowing] = useState(false);

  return (
    <View style={[styles.card, { height: CARD_HEIGHT }]}>
      <LinearGradient
        colors={[artist.color, '#140329']}
        style={styles.cardGradient}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      >
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{artist.name[0]}</Text>
          </View>
          <View style={styles.genreTag}>
            <Text style={styles.genreTagText}>{artist.genre}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.artistName}>{artist.name}</Text>
          <Text style={styles.artistBio} numberOfLines={2}>{artist.bio}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{artist.followers.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Fans</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{artist.events}</Text>
              <Text style={styles.statLabel}>Shows</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.followBtn, following && styles.followBtnActive]}
            onPress={() => setFollowing(!following)}
            activeOpacity={0.85}
          >
            <Ionicons
              name={following ? 'checkmark' : 'add'}
              size={18}
              color={following ? colors.primaryLight : colors.primary}
            />
            <Text style={[styles.followBtnText, following && styles.followBtnTextActive]}>
              {following ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

export default function ExploreScreen() {
  const [activeGenre, setActiveGenre] = useState('All');

  const filtered =
    activeGenre === 'All' ? ARTISTS : ARTISTS.filter((a) => a.genre === activeGenre);

  return (
    <LinearGradient colors={['#1a0533', '#140329']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore Artists</Text>
          <Text style={styles.headerSub}>Scroll through the underground</Text>
        </View>

        {/* Genre filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreList}
          style={styles.genreScroll}
        >
          {GENRES.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genreChip, activeGenre === g && styles.genreChipActive]}
              onPress={() => setActiveGenre(g)}
              activeOpacity={0.8}
            >
              <Text style={[styles.genreChipText, activeGenre === g && styles.genreChipTextActive]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Artist feed */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feed}
          showsVerticalScrollIndicator={false}
          snapToInterval={CARD_HEIGHT + 16}
          decelerationRate="fast"
          renderItem={({ item }) => <ArtistCard artist={item} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="mic-outline" size={52} color={colors.textMuted} />
              <Text style={styles.emptyText}>No artists in this genre</Text>
            </View>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: colors.white },
  headerSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  genreScroll: { flexGrow: 0, marginBottom: 16 },
  genreList: { paddingHorizontal: 20, gap: 8 },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  genreChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  genreChipText: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  genreChipTextActive: { color: colors.white, fontWeight: '600' },
  feed: { paddingHorizontal: 20, paddingBottom: 20, gap: 16 },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardGradient: { flex: 1, padding: 24, justifyContent: 'space-between' },
  avatarWrap: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarLetter: { fontSize: 34, fontWeight: '800', color: colors.white },
  genreTag: {
    backgroundColor: 'rgba(123,47,190,0.35)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(123,47,190,0.5)',
  },
  genreTagText: { color: colors.primaryLight, fontSize: 13, fontWeight: '600' },
  info: {},
  artistName: { fontSize: 30, fontWeight: '800', color: colors.white, marginBottom: 10 },
  artistBio: { fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 22, marginBottom: 22 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  stat: { alignItems: 'center', paddingHorizontal: 24 },
  statNum: { fontSize: 24, fontWeight: '800', color: colors.white },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  statSep: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.15)' },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 14,
  },
  followBtnActive: {
    backgroundColor: 'rgba(123,47,190,0.25)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followBtnText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  followBtnTextActive: { color: colors.primaryLight },
  empty: { alignItems: 'center', paddingTop: 80, gap: 14 },
  emptyText: { color: colors.textMuted, fontSize: 16 },
});
