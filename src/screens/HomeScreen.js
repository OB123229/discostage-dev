import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { EVENTS, GENRES } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

function EventCard({ event }) {
  const [liked, setLiked] = useState(false);
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.88}>
      {/* Colored header */}
      <View style={[styles.cardTop, { backgroundColor: event.color }]}>
        <View style={styles.cardTopRow}>
          <View style={styles.genrePill}>
            <Text style={styles.genrePillText}>{event.genre}</Text>
          </View>
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => setLiked(!liked)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={19}
              color={liked ? '#FF6B9D' : colors.white}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.cardTopInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{event.title}</Text>
          <View style={styles.artistRow}>
            <Text style={styles.cardArtist}>{event.artist}</Text>
            {event.verified && (
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={colors.primaryLight}
                style={{ marginLeft: 5 }}
              />
            )}
          </View>
        </View>
      </View>

      {/* Card body */}
      <View style={styles.cardBody}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>{event.venue}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
            <Text style={styles.metaText}>{event.date} · {event.time}</Text>
          </View>
        </View>
        <View style={styles.footerRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#FFD700" />
            <Text style={styles.ratingText}>{event.rating}</Text>
          </View>
          <View style={styles.vibePill}>
            <Text style={styles.vibeText}>{event.vibe}</Text>
          </View>
          <View style={styles.interestedRow}>
            <Ionicons name="people-outline" size={13} color={colors.textMuted} />
            <Text style={styles.interestedText}>{event.interested} going</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [activeGenre, setActiveGenre] = useState('All');
  const { profile } = useAuth();

  const filtered =
    activeGenre === 'All' ? EVENTS : EVENTS.filter((e) => e.genre === activeGenre);

  return (
    <LinearGradient colors={['#1a0533', '#2D0A5C', '#140329']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {profile?.town ? (
              <Text style={styles.locationLabel}>
                <Ionicons name="location" size={12} color={colors.primary} /> {profile.town}, {profile.state}
              </Text>
            ) : null}
            <Text style={styles.headerTitle}>What's happening</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={colors.white} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
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

        {/* Events list */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <EventCard event={item} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="musical-notes-outline" size={52} color={colors.textMuted} />
              <Text style={styles.emptyText}>No events for this genre yet</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 16,
  },
  locationLabel: { fontSize: 12, color: colors.primary, fontWeight: '600', marginBottom: 3 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: colors.white },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4757',
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  genreScroll: { flexGrow: 0, marginBottom: 14 },
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
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: { padding: 16, minHeight: 110, justifyContent: 'space-between' },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  genrePill: {
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  genrePillText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  heartBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTopInfo: { marginTop: 8 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: colors.white, marginBottom: 4 },
  artistRow: { flexDirection: 'row', alignItems: 'center' },
  cardArtist: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  cardBody: { padding: 14 },
  metaRow: { flexDirection: 'row', gap: 14, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  metaText: { color: colors.textSecondary, fontSize: 13 },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: '#FFD700', fontSize: 13, fontWeight: '600' },
  vibePill: {
    backgroundColor: 'rgba(123,47,190,0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  vibeText: { color: colors.primaryLight, fontSize: 11, fontWeight: '500' },
  interestedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  interestedText: { color: colors.textMuted, fontSize: 13 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 14 },
  emptyText: { color: colors.textMuted, fontSize: 16 },
});
