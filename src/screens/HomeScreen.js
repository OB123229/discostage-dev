import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Modal,
  Linking,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { GENRES, getUpcomingEvents } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useSavedEvents } from '../context/SavedEventsContext';

const VENUE_TYPE_ICONS = {
  'Bar/Club': 'wine-outline',
  'Restaurant': 'restaurant-outline',
  'Cafe': 'cafe-outline',
  'House': 'home-outline',
  'Campus Space': 'school-outline',
  'Public Space': 'sunny-outline',
};

function StarRating({ value, onChange }) {
  return (
    <View style={starStyles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onChange(star)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={30}
            color="#FFD700"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const starStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
});

function RateModal({ visible, event, onClose }) {
  const [artistRating, setArtistRating] = useState(0);
  const [venueRating, setVenueRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setArtistRating(0);
      setVenueRating(0);
      onClose();
    }, 1400);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={modalStyles.overlay} onPress={onClose}>
        <Pressable style={modalStyles.sheet} onPress={() => {}}>
          {submitted ? (
            <View style={modalStyles.thankYou}>
              <Ionicons name="checkmark-circle" size={48} color={colors.primaryLight} />
              <Text style={modalStyles.thankYouText}>Thanks for rating!</Text>
            </View>
          ) : (
            <>
              <Text style={modalStyles.title}>Rate this event</Text>
              <Text style={modalStyles.subtitle}>{event?.title}</Text>

              <View style={modalStyles.ratingSection}>
                <Text style={modalStyles.ratingLabel}>Artist — {event?.artist}</Text>
                <StarRating value={artistRating} onChange={setArtistRating} />
              </View>

              <View style={modalStyles.ratingSection}>
                <Text style={modalStyles.ratingLabel}>Venue — {event?.venue}</Text>
                <StarRating value={venueRating} onChange={setVenueRating} />
              </View>

              <TouchableOpacity
                style={[modalStyles.submitBtn, !(artistRating || venueRating) && modalStyles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!(artistRating || venueRating)}
              >
                <Text style={modalStyles.submitBtnText}>Submit Rating</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={modalStyles.cancelBtn}>
                <Text style={modalStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function VenueModal({ visible, event, onClose }) {
  if (!event) return null;
  const { venueDetails } = event;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={modalStyles.overlay} onPress={onClose}>
        <Pressable style={modalStyles.sheet} onPress={() => {}}>
          <Text style={modalStyles.title}>{event.venue}</Text>
          <View style={modalStyles.venueTypeBadge}>
            <Ionicons name={VENUE_TYPE_ICONS[event.venueType] || 'business-outline'} size={14} color={colors.primaryLight} />
            <Text style={modalStyles.venueTypeText}>{event.venueType}</Text>
          </View>

          <View style={modalStyles.detailsGrid}>
            <DetailRow icon="partly-sunny-outline" label="Setting" value={venueDetails.setting} />
            <DetailRow icon="people-outline" label="Capacity" value={venueDetails.capacity} />
            <DetailRow
              icon="car-outline"
              label="Parking"
              value={venueDetails.parking ? 'Available' : 'Not available'}
              positive={venueDetails.parking}
            />
            <DetailRow
              icon="water-outline"
              label="Restrooms"
              value={venueDetails.restrooms ? 'Available' : 'Not available'}
              positive={venueDetails.restrooms}
            />
          </View>

          <TouchableOpacity onPress={onClose} style={modalStyles.cancelBtn}>
            <Text style={modalStyles.cancelText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DetailRow({ icon, label, value, positive }) {
  return (
    <View style={modalStyles.detailRow}>
      <Ionicons name={icon} size={16} color={colors.textMuted} style={{ width: 22 }} />
      <Text style={modalStyles.detailLabel}>{label}</Text>
      <Text style={[modalStyles.detailValue, positive === false && { color: '#FF6B6B' }]}>{value}</Text>
    </View>
  );
}

function EventCard({ event }) {
  const { isSaved, toggleSaved } = useSavedEvents();
  const liked = isSaved(event.id);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);

  const openDirections = () => {
    const encoded = encodeURIComponent(event.address);
    Linking.openURL(`https://maps.google.com/?q=${encoded}`);
  };

  return (
    <View style={styles.card}>
      {/* Colored header */}
      <View style={[styles.cardTop, { backgroundColor: event.color }]}>
        <View style={styles.cardTopRow}>
          <View style={styles.genrePill}>
            <Text style={styles.genrePillText}>{event.genre}</Text>
          </View>
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => toggleSaved(event.id)}
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
              <Ionicons name="checkmark-circle" size={14} color={colors.primaryLight} style={{ marginLeft: 5 }} />
            )}
          </View>
        </View>
      </View>

      {/* Card body */}
      <View style={styles.cardBody}>
        {/* Venue row */}
        <View style={styles.venueRow}>
          <Ionicons name="location-outline" size={13} color={colors.textMuted} />
          <TouchableOpacity onPress={() => setShowVenueModal(true)} style={styles.venueTouchable}>
            <Text style={styles.venueName} numberOfLines={1}>{event.venue}</Text>
          </TouchableOpacity>
          <View style={styles.venueTypePill}>
            <Ionicons name={VENUE_TYPE_ICONS[event.venueType] || 'business-outline'} size={11} color={colors.primaryLight} />
            <Text style={styles.venueTypeText}>{event.venueType}</Text>
          </View>
        </View>

        {/* Directions + RSVP row */}
        <View style={styles.subVenueRow}>
          <TouchableOpacity style={styles.directionsBtn} onPress={openDirections}>
            <Ionicons name="navigate-outline" size={12} color={colors.primaryLight} />
            <Text style={styles.directionsBtnText}>Get directions</Text>
          </TouchableOpacity>
          {event.requireRSVP && (
            <View style={styles.rsvpBadge}>
              <Ionicons name="ticket-outline" size={11} color="#FFD700" />
              <Text style={styles.rsvpText}>RSVP required</Text>
            </View>
          )}
        </View>

        {/* Date row */}
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
          <Text style={styles.metaText}>{event.date} · {event.time}</Text>
        </View>

        {/* Footer */}
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
          <TouchableOpacity style={styles.rateBtn} onPress={() => setShowRateModal(true)}>
            <Ionicons name="star-outline" size={13} color={colors.primaryLight} />
            <Text style={styles.rateBtnText}>Rate</Text>
          </TouchableOpacity>
        </View>
      </View>

      <VenueModal visible={showVenueModal} event={event} onClose={() => setShowVenueModal(false)} />
      <RateModal visible={showRateModal} event={event} onClose={() => setShowRateModal(false)} />
    </View>
  );
}

export default function HomeScreen() {
  const [activeGenre, setActiveGenre] = useState('All');
  const { profile } = useAuth();

  const upcoming = getUpcomingEvents();
  const filtered =
    activeGenre === 'All' ? upcoming : upcoming.filter((e) => e.genre === activeGenre);

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
            <Text style={styles.headerTitle}>Upcoming Events</Text>
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
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
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
  cardBody: { padding: 14, gap: 8 },

  // Venue
  venueRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  venueTouchable: { flex: 1 },
  venueName: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  venueTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  venueTypeText: { color: colors.primaryLight, fontSize: 11, fontWeight: '500' },

  // Sub-venue row
  subVenueRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(168,85,247,0.12)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.25)',
  },
  directionsBtnText: { color: colors.primaryLight, fontSize: 12, fontWeight: '500' },
  rsvpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  rsvpText: { color: '#FFD700', fontSize: 12, fontWeight: '600' },

  // Date
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: colors.textSecondary, fontSize: 13 },

  // Footer
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
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
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(168,85,247,0.18)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.35)',
  },
  rateBtnText: { color: colors.primaryLight, fontSize: 12, fontWeight: '600' },

  empty: { alignItems: 'center', paddingTop: 60, gap: 14 },
  emptyText: { color: colors.textMuted, fontSize: 16 },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,
    paddingBottom: 40,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: -8,
  },
  venueTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: -6,
  },
  venueTypeText: { color: colors.primaryLight, fontSize: 13, fontWeight: '500' },
  ratingSection: { gap: 10 },
  ratingLabel: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
  detailsGrid: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabel: { color: colors.textMuted, fontSize: 14, flex: 1 },
  detailValue: { color: colors.white, fontSize: 14, fontWeight: '600' },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 6 },
  cancelText: { color: colors.textMuted, fontSize: 14 },
  thankYou: { alignItems: 'center', gap: 14, paddingVertical: 20 },
  thankYouText: { color: colors.white, fontSize: 18, fontWeight: '700' },
});
