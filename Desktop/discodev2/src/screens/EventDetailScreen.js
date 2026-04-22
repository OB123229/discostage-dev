import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useSavedEvents } from '../context/SavedEventsContext';

const VENUE_TYPE_ICONS = {
  'Bar/Club': 'wine-outline',
  'Restaurant': 'restaurant-outline',
  'Cafe': 'cafe-outline',
  'House': 'home-outline',
  'Campus Space': 'school-outline',
  'Public Space': 'sunny-outline',
};

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onChange(star)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={star <= value ? 'star' : 'star-outline'} size={32} color="#FFD700" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Rate Modal ───────────────────────────────────────────────────────────────
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
      <Pressable style={ms.overlay} onPress={onClose}>
        <Pressable style={ms.sheet} onPress={() => {}}>
          {submitted ? (
            <View style={ms.thankYou}>
              <Ionicons name="checkmark-circle" size={52} color={colors.primaryLight} />
              <Text style={ms.thankYouText}>Thanks for rating!</Text>
            </View>
          ) : (
            <>
              <Text style={ms.title}>Rate this event</Text>
              <Text style={ms.subtitle}>{event?.title}</Text>

              <View style={ms.ratingBlock}>
                <Text style={ms.ratingLabel}>Artist — {event?.artist}</Text>
                <StarRating value={artistRating} onChange={setArtistRating} />
              </View>

              <View style={ms.ratingBlock}>
                <Text style={ms.ratingLabel}>Venue — {event?.venue}</Text>
                <StarRating value={venueRating} onChange={setVenueRating} />
              </View>

              <TouchableOpacity
                style={[ms.submitBtn, !(artistRating || venueRating) && ms.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!(artistRating || venueRating)}
              >
                <Text style={ms.submitBtnText}>Submit Rating</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={ms.cancelBtn}>
                <Text style={ms.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, valueColor }) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoIconWrap}>
        <Ionicons name={icon} size={16} color={colors.primaryLight} />
      </View>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={[s.infoValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function EventDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { event } = route.params;
  const { isSaved, toggleSaved } = useSavedEvents();
  const [showRateModal, setShowRateModal] = useState(false);
  const liked = isSaved(event.id);

  const openDirections = () => {
    const encoded = encodeURIComponent(event.address);
    Linking.openURL(`https://maps.google.com/?q=${encoded}`);
  };

  const vd = event.venueDetails ?? {};

  return (
    <LinearGradient colors={['#1a0533', '#140329']} style={{ flex: 1 }}>
      {/* Fixed back button overlay */}
      <View style={[s.backRow, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* Hero banner */}
        <View style={[s.hero, { backgroundColor: event.color ?? colors.primary, paddingTop: insets.top + 56 }]}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)']}
            style={StyleSheet.absoluteFill}
          />

          {/* Genre + save */}
          <View style={s.heroTopRow}>
            <View style={s.genrePill}>
              <Text style={s.genrePillText}>{event.genre}</Text>
            </View>
            <TouchableOpacity
              style={s.heartBtn}
              onPress={() => toggleSaved(event.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? '#FF6B9D' : colors.white} />
            </TouchableOpacity>
          </View>

          {/* Title + artist */}
          <View style={s.heroBottom}>
            {event.requireRSVP && (
              <View style={s.rsvpBadge}>
                <Ionicons name="ticket-outline" size={12} color="#FFD700" />
                <Text style={s.rsvpText}>RSVP Required</Text>
              </View>
            )}
            <Text style={s.heroTitle}>{event.title}</Text>
            <View style={s.artistRow}>
              <Text style={s.heroArtist}>{event.artist}</Text>
              {event.verified && (
                <Ionicons name="checkmark-circle" size={16} color={colors.primaryLight} style={{ marginLeft: 6 }} />
              )}
            </View>
          </View>
        </View>

        {/* Stats strip */}
        <View style={s.statsStrip}>
          <View style={s.statItem}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={s.statValue}>{event.rating ?? '—'}</Text>
            <Text style={s.statLabel}>Rating</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Ionicons name="people-outline" size={14} color={colors.primaryLight} />
            <Text style={s.statValue}>{event.interested ?? 0}</Text>
            <Text style={s.statLabel}>Going</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Ionicons name="musical-notes-outline" size={14} color={colors.primaryLight} />
            <Text style={s.statValue} numberOfLines={1}>{event.vibe ?? '—'}</Text>
            <Text style={s.statLabel}>Vibe</Text>
          </View>
        </View>

        <View style={s.body}>
          {/* Date & Time */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Date & Time</Text>
            <View style={s.card}>
              <InfoRow icon="calendar-outline" label="Date" value={event.date ?? '—'} />
              <View style={s.divider} />
              <InfoRow icon="time-outline" label="Time" value={event.time ?? '—'} />
            </View>
          </View>

          {/* Venue */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Venue</Text>
            <View style={s.card}>
              <View style={s.venueNameRow}>
                <Ionicons name={VENUE_TYPE_ICONS[event.venueType] ?? 'business-outline'} size={18} color={colors.primaryLight} />
                <View style={{ flex: 1 }}>
                  <Text style={s.venueName}>{event.venue}</Text>
                  {event.venueType && <Text style={s.venueType}>{event.venueType}</Text>}
                </View>
              </View>

              {event.address && (
                <>
                  <View style={s.divider} />
                  <InfoRow icon="location-outline" label="Address" value={event.address} />
                </>
              )}

              {event.area && (
                <>
                  <View style={s.divider} />
                  <InfoRow icon="map-outline" label="Area" value={event.area} />
                </>
              )}

              {event.address && (
                <TouchableOpacity style={s.directionsBtn} onPress={openDirections} activeOpacity={0.85}>
                  <Ionicons name="navigate" size={15} color={colors.white} />
                  <Text style={s.directionsBtnText}>Get Directions</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Venue Details */}
          {(vd.setting || vd.capacity || vd.parking != null || vd.restrooms != null) && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Venue Details</Text>
              <View style={s.card}>
                {vd.setting && <InfoRow icon="partly-sunny-outline" label="Setting" value={vd.setting} />}
                {vd.capacity && (
                  <>
                    <View style={s.divider} />
                    <InfoRow icon="people-outline" label="Capacity" value={vd.capacity} />
                  </>
                )}
                {vd.parking != null && (
                  <>
                    <View style={s.divider} />
                    <InfoRow
                      icon="car-outline"
                      label="Parking"
                      value={vd.parking ? 'Available' : 'Not available'}
                      valueColor={vd.parking ? '#4CD964' : '#FF6B6B'}
                    />
                  </>
                )}
                {vd.restrooms != null && (
                  <>
                    <View style={s.divider} />
                    <InfoRow
                      icon="water-outline"
                      label="Restrooms"
                      value={vd.restrooms ? 'Available' : 'Not available'}
                      valueColor={vd.restrooms ? '#4CD964' : '#FF6B6B'}
                    />
                  </>
                )}
              </View>
            </View>
          )}

          {/* RSVP notice */}
          {event.requireRSVP && (
            <View style={s.rsvpCard}>
              <Ionicons name="ticket" size={22} color="#FFD700" />
              <View style={{ flex: 1 }}>
                <Text style={s.rsvpCardTitle}>RSVP Required</Text>
                <Text style={s.rsvpCardSub}>You must RSVP to attend this event</Text>
              </View>
              <TouchableOpacity style={s.rsvpBtn} activeOpacity={0.85}>
                <Text style={s.rsvpBtnText}>RSVP Now</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Rate button */}
          <TouchableOpacity style={s.rateCard} onPress={() => setShowRateModal(true)} activeOpacity={0.85}>
            <LinearGradient colors={['rgba(168,85,247,0.18)', 'rgba(123,47,190,0.12)']} style={s.rateCardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="star-outline" size={22} color={colors.primaryLight} />
              <View style={{ flex: 1 }}>
                <Text style={s.rateCardTitle}>Rate this Event</Text>
                <Text style={s.rateCardSub}>Share your experience with the community</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <RateModal visible={showRateModal} event={event} onClose={() => setShowRateModal(false)} />
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  backRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hero
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
    minHeight: 240,
    justifyContent: 'flex-end',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  genrePill: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  genrePillText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  heartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBottom: { gap: 6 },
  rsvpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.35)',
  },
  rsvpText: { color: '#FFD700', fontSize: 12, fontWeight: '700' },
  heroTitle: { fontSize: 30, fontWeight: '900', color: colors.white, lineHeight: 34 },
  artistRow: { flexDirection: 'row', alignItems: 'center' },
  heroArtist: { fontSize: 16, color: 'rgba(255,255,255,0.82)', fontWeight: '500' },

  // Stats strip
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { color: colors.white, fontSize: 14, fontWeight: '700', maxWidth: 100 },
  statLabel: { color: colors.textMuted, fontSize: 11 },
  statDivider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },

  // Body
  body: { paddingHorizontal: 20, paddingTop: 24, gap: 24 },
  section: { gap: 10 },
  sectionTitle: { color: colors.white, fontSize: 16, fontWeight: '800' },

  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 0,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: 'rgba(168,85,247,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: { flex: 1, color: colors.textMuted, fontSize: 14 },
  infoValue: { color: colors.white, fontSize: 14, fontWeight: '600', textAlign: 'right', maxWidth: 200 },

  venueNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  venueName: { color: colors.white, fontSize: 16, fontWeight: '700' },
  venueType: { color: colors.textMuted, fontSize: 13, marginTop: 2 },

  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 14,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 11,
  },
  directionsBtnText: { color: colors.white, fontSize: 14, fontWeight: '700' },

  rsvpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    padding: 16,
  },
  rsvpCardTitle: { color: '#FFD700', fontSize: 15, fontWeight: '700' },
  rsvpCardSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  rsvpBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  rsvpBtnText: { color: '#1a0533', fontSize: 13, fontWeight: '800' },

  rateCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  rateCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  rateCardTitle: { color: colors.white, fontSize: 15, fontWeight: '700' },
  rateCardSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});

const ms = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,
    paddingBottom: 44,
    gap: 18,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.white, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: -8 },
  ratingBlock: { gap: 12 },
  ratingLabel: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
  submitBtn: {
    backgroundColor: colors.primary, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.35 },
  submitBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 4 },
  cancelText: { color: colors.textMuted, fontSize: 14 },
  thankYou: { alignItems: 'center', gap: 14, paddingVertical: 24 },
  thankYouText: { color: colors.white, fontSize: 20, fontWeight: '700' },
});
