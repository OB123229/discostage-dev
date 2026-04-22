import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { GENRES } from '../data/mockData';
import { createEvent } from '../services/eventService';
import { useAuth } from '../context/AuthContext';

const GENRE_OPTIONS = GENRES.filter((g) => g !== 'All');

function Field({ label, sub, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {sub ? <Text style={styles.labelSub}>{sub}</Text> : null}
      {children}
    </View>
  );
}

function StyledInput({ placeholder, value, onChangeText, keyboardType, maxLength, autoCapitalize }) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      maxLength={maxLength}
      autoCapitalize={autoCapitalize}
      autoCorrect={false}
    />
  );
}

// Parse "MM/DD/YYYY" → "YYYY-MM-DD" for Supabase
function parseDateInput(raw) {
  const parts = raw.trim().split('/');
  if (parts.length !== 3) return null;
  const [mm, dd, yyyy] = parts;
  if (mm.length > 2 || dd.length > 2 || yyyy.length !== 4) return null;
  const d = new Date(`${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`);
  if (isNaN(d.getTime())) return null;
  return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
}

export default function CreateEventScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [genre, setGenre] = useState(null);
  const [vibe, setVibe] = useState('');
  const [requireRsvp, setRequireRsvp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const canCreate = title.trim() && date.trim() && time.trim() && venue.trim() && city.trim() && state.trim() && genre;

  const handleCreate = async () => {
    if (!canCreate || submitting) return;

    const concertDate = parseDateInput(date.trim());
    if (!concertDate) {
      Alert.alert('Invalid date', 'Please enter the date as MM/DD/YYYY (e.g. 04/28/2026).');
      return;
    }

    setSubmitting(true);
    try {
      await createEvent(user.id, profile?.name, {
        title: title.trim(),
        venue: venue.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase(),
        concertDate,
        time: time.trim(),
        genre,
        vibe: vibe.trim(),
        requireRsvp,
      });
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setTitle(''); setDate(''); setTime(''); setVenue('');
        setCity(''); setState(''); setAddress('');
        setGenre(null); setVibe(''); setRequireRsvp(false);
        navigation.navigate('Events');
      }, 1600);
    } catch (err) {
      Alert.alert('Could not create event', err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#1a0533', '#2D0A5C', '#140329']} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={26} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Event</Text>
          <TouchableOpacity
            style={[styles.createBtn, !canCreate && styles.createBtnDisabled]}
            onPress={handleCreate}
            disabled={!canCreate || submitting}
          >
            {submitting
              ? <ActivityIndicator size="small" color={colors.white} />
              : <Text style={styles.createBtnText}>Post</Text>
            }
          </TouchableOpacity>
        </View>

        {done ? (
          <View style={styles.successWrap}>
            <Ionicons name="checkmark-circle" size={64} color={colors.primaryLight} />
            <Text style={styles.successTitle}>Event created!</Text>
            <Text style={styles.successSub}>Your show is live on Events</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Artist banner */}
            <View style={styles.artistBanner}>
              <View style={styles.artistBannerIcon}>
                <Ionicons name="mic" size={18} color={colors.primaryLight} />
              </View>
              <Text style={styles.artistBannerText}>
                Posting as <Text style={{ color: colors.primaryLight, fontWeight: '700' }}>{profile?.name ?? 'Artist'}</Text>
              </Text>
            </View>

            {/* Event name */}
            <Field label="Event Name" sub="Give your show a title">
              <StyledInput
                placeholder="e.g. Midnight Echo Live"
                value={title}
                onChangeText={setTitle}
              />
            </Field>

            {/* Date & Time */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Field label="Date" sub="MM/DD/YYYY">
                  <StyledInput
                    placeholder="04/28/2026"
                    value={date}
                    onChangeText={setDate}
                    keyboardType="numbers-and-punctuation"
                  />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Time" sub="e.g. 9:00 PM">
                  <StyledInput
                    placeholder="9:00 PM"
                    value={time}
                    onChangeText={setTime}
                  />
                </Field>
              </View>
            </View>

            {/* Venue */}
            <Field label="Venue" sub="Name of the venue">
              <StyledInput
                placeholder="e.g. The Fox Theatre"
                value={venue}
                onChangeText={setVenue}
              />
            </Field>

            {/* City & State */}
            <View style={styles.row}>
              <View style={{ flex: 2 }}>
                <Field label="City">
                  <StyledInput
                    placeholder="Boulder"
                    value={city}
                    onChangeText={setCity}
                  />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="State">
                  <StyledInput
                    placeholder="CO"
                    value={state}
                    onChangeText={setState}
                    autoCapitalize="characters"
                    maxLength={2}
                  />
                </Field>
              </View>
            </View>

            {/* Address (optional) */}
            <Field label="Address" sub="Optional — street address">
              <StyledInput
                placeholder="1135 13th St"
                value={address}
                onChangeText={setAddress}
              />
            </Field>

            {/* Genre */}
            <Field label="Genre" sub="Tag your show so the right fans find it">
              <View style={styles.genreGrid}>
                {GENRE_OPTIONS.map((g) => {
                  const active = genre === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setGenre(active ? null : g)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{g}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Field>

            {/* Vibe (optional) */}
            <Field label="Vibe" sub="Optional — describe the energy (e.g. High Energy • Intimate)">
              <StyledInput
                placeholder="High Energy • Intimate"
                value={vibe}
                onChangeText={setVibe}
              />
            </Field>

            {/* Require RSVP */}
            <View style={styles.rsvpRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Require RSVP</Text>
                <Text style={styles.labelSub}>Fans must RSVP before attending</Text>
              </View>
              <Switch
                value={requireRsvp}
                onValueChange={setRequireRsvp}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            {/* Create button */}
            <TouchableOpacity
              style={[styles.submitBtn, !canCreate && styles.submitBtnDisabled]}
              onPress={handleCreate}
              disabled={!canCreate || submitting}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={canCreate ? ['#C084FC', '#7B2FBE'] : ['#3D1A70', '#3D1A70']}
                style={styles.submitBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="calendar" size={20} color={canCreate ? colors.white : colors.textMuted} />
                    <Text style={[styles.submitBtnText, !canCreate && { color: colors.textMuted }]}>
                      Create Event
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.white },
  createBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 7,
    minWidth: 58,
    alignItems: 'center',
  },
  createBtnDisabled: { backgroundColor: 'rgba(123,47,190,0.3)' },
  createBtnText: { color: colors.white, fontSize: 14, fontWeight: '700' },

  scroll: { paddingHorizontal: 20, paddingTop: 24, gap: 22 },

  artistBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(123,47,190,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(123,47,190,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  artistBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(168,85,247,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistBannerText: { color: colors.textSecondary, fontSize: 14 },

  field: { gap: 6 },
  label: { color: colors.white, fontSize: 15, fontWeight: '700' },
  labelSub: { color: colors.textMuted, fontSize: 12, marginTop: -2 },

  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.white,
    fontSize: 15,
  },

  row: { flexDirection: 'row', gap: 12 },

  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  chipTextActive: { color: colors.white, fontWeight: '700' },

  rsvpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },

  submitBtn: { borderRadius: 16, overflow: 'hidden' },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  submitBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },

  successWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  successTitle: { color: colors.white, fontSize: 24, fontWeight: '800' },
  successSub: { color: colors.textMuted, fontSize: 15 },
});
