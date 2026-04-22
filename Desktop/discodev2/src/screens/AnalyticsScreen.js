import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useSavedEvents } from '../context/SavedEventsContext';
import { getUpcomingEvents } from '../data/mockData';

const TABS = ['Saved', 'Following'];

export default function AnalyticsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { savedEvents } = useSavedEvents();
  const [activeTab, setActiveTab] = useState('Saved');

  const upcomingEvents = getUpcomingEvents();

  const displayEvents = activeTab === 'Saved' ? savedEvents : upcomingEvents;

  return (
    <LinearGradient colors={['#1a0533', '#140329']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={26} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={{ width: 26 }} />
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{savedEvents.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{upcomingEvents.length}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>Artists</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Event list */}
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {displayEvents.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons
                name={activeTab === 'Saved' ? 'heart-outline' : 'musical-notes-outline'}
                size={48}
                color={colors.textMuted}
              />
              <Text style={styles.emptyTitle}>
                {activeTab === 'Saved' ? 'No saved events yet' : 'No upcoming events'}
              </Text>
              <Text style={styles.emptySub}>
                {activeTab === 'Saved'
                  ? 'Tap the heart on any event to save it here'
                  : 'Check back soon for shows near you'}
              </Text>
            </View>
          ) : (
            displayEvents.map((event) => (
              <View key={event.id} style={styles.card}>
                <View style={[styles.colorBar, { backgroundColor: event.color ?? colors.primary }]} />
                <View style={styles.cardContent}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{event.title}</Text>
                    {event.requireRSVP && (
                      <View style={styles.rsvpBadge}>
                        <Text style={styles.rsvpText}>RSVP</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardArtist}>{event.artist}</Text>
                  <View style={styles.cardMeta}>
                    <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                    <Text style={styles.cardMetaText}>{event.venue} · {event.area}</Text>
                  </View>
                  <View style={styles.cardMeta}>
                    <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                    <Text style={styles.cardMetaText}>{event.date} · {event.time}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.white },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statNum: { fontSize: 26, fontWeight: '800', color: colors.white },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4 },

  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: colors.white },

  list: { paddingHorizontal: 20, gap: 12 },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.white },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', maxWidth: 260 },

  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  colorBar: { width: 5 },
  cardContent: { flex: 1, padding: 14, gap: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.white, flex: 1 },
  cardArtist: { fontSize: 13, color: colors.primaryLight, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardMetaText: { fontSize: 12, color: colors.textMuted },
  rsvpBadge: {
    backgroundColor: 'rgba(255,215,0,0.12)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    marginLeft: 8,
  },
  rsvpText: { color: '#FFD700', fontSize: 10, fontWeight: '700' },
});
