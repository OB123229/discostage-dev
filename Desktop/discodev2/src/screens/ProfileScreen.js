import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Switch,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useSavedEvents } from '../context/SavedEventsContext';
import { getUpcomingEvents } from '../data/mockData';
import { fetchArtistStats, fetchArtistEvents } from '../services/eventService';

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
function EditProfileModal({ visible, profile, onClose, onSave }) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(profile?.name ?? '');

  useEffect(() => {
    if (visible) setName(profile?.name ?? '');
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={modal.overlay} onPress={onClose}>
        <Pressable style={[modal.sheet, { paddingBottom: insets.bottom + 24 }]} onPress={() => {}}>
          <View style={modal.handle} />
          <Text style={modal.title}>Edit Profile</Text>

          <View style={modal.field}>
            <Text style={modal.fieldLabel}>Display Name</Text>
            <TextInput
              style={modal.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={modal.field}>
            <Text style={modal.fieldLabel}>Role</Text>
            <View style={modal.readOnlyRow}>
              <Ionicons
                name={profile?.role === 'ARTIST' ? 'mic-outline' : 'musical-notes-outline'}
                size={15}
                color={colors.textMuted}
              />
              <Text style={modal.readOnlyText}>{profile?.role ?? '—'}</Text>
            </View>
          </View>

          <View style={modal.field}>
            <Text style={modal.fieldLabel}>Location</Text>
            <View style={modal.readOnlyRow}>
              <Ionicons name="location-outline" size={15} color={colors.textMuted} />
              <Text style={modal.readOnlyText}>
                {profile?.town ? `${profile.town}, ${profile.state}` : '—'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={modal.saveBtn}
            onPress={() => { onSave({ name }); onClose(); }}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#C084FC', '#7B2FBE']} style={modal.saveBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={modal.saveBtnText}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Change Location Modal ────────────────────────────────────────────────────
function ChangeLocationModal({ visible, profile, onClose, onSave }) {
  const insets = useSafeAreaInsets();
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setCity(profile?.town ?? '');
      setState(profile?.state ?? '');
    }
  }, [visible]);

  const handleSave = async () => {
    if (!city.trim() || !state.trim()) return;
    setSaving(true);
    try {
      await onSave({ town: city.trim(), state: state.trim() });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={modal.overlay} onPress={onClose}>
        <Pressable style={[modal.sheet, { paddingBottom: insets.bottom + 24 }]} onPress={() => {}}>
          <View style={modal.handle} />
          <Text style={modal.title}>Change Location</Text>
          <Text style={modal.subtitle}>Used to show shows near you</Text>

          <View style={modal.field}>
            <Text style={modal.fieldLabel}>City</Text>
            <TextInput
              style={modal.input}
              value={city}
              onChangeText={setCity}
              placeholder="e.g. Boulder"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={modal.field}>
            <Text style={modal.fieldLabel}>State</Text>
            <TextInput
              style={modal.input}
              value={state}
              onChangeText={setState}
              placeholder="e.g. CO"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              maxLength={2}
            />
          </View>

          <TouchableOpacity
            style={[modal.saveBtn, (!city.trim() || !state.trim()) && { opacity: 0.5 }]}
            onPress={handleSave}
            disabled={!city.trim() || !state.trim() || saving}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#C084FC', '#7B2FBE']} style={modal.saveBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {saving
                ? <ActivityIndicator size="small" color={colors.white} />
                : <Text style={modal.saveBtnText}>Save Location</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Switch Account Modal ─────────────────────────────────────────────────────
function SwitchAccountModal({ visible, profile, onClose, onSwitch }) {
  const insets = useSafeAreaInsets();
  const isFan = profile?.role !== 'ARTIST';
  const targetRole = isFan ? 'ARTIST' : 'FAN';
  const [loading, setLoading] = useState(false);

  const handleSwitch = async () => {
    setLoading(true);
    try {
      await onSwitch(targetRole);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={modal.overlay} onPress={onClose}>
        <Pressable style={[modal.sheet, { paddingBottom: insets.bottom + 24 }]} onPress={() => {}}>
          <View style={modal.handle} />
          <Text style={modal.title}>Switch Account Type</Text>

          <View style={modal.accountRow}>
            <View style={[modal.accountCard, !isFan && modal.accountCardActive]}>
              <Ionicons name="mic" size={28} color={!isFan ? colors.primaryLight : colors.textMuted} />
              <Text style={[modal.accountCardLabel, !isFan && { color: colors.white }]}>Artist</Text>
              <Text style={modal.accountCardSub}>Upload clips, manage shows</Text>
            </View>
            <View style={[modal.accountCard, isFan && modal.accountCardActive]}>
              <Ionicons name="musical-notes" size={28} color={isFan ? colors.primaryLight : colors.textMuted} />
              <Text style={[modal.accountCardLabel, isFan && { color: colors.white }]}>Fan</Text>
              <Text style={modal.accountCardSub}>Discover shows near you</Text>
            </View>
          </View>

          <Text style={modal.switchNote}>
            Currently: <Text style={{ color: colors.primaryLight, fontWeight: '700' }}>{profile?.role ?? '—'}</Text>
            {'  →  '}
            Switching to: <Text style={{ color: colors.primaryLight, fontWeight: '700' }}>{targetRole}</Text>
          </Text>

          <TouchableOpacity style={modal.saveBtn} onPress={handleSwitch} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={['#C084FC', '#7B2FBE']} style={modal.saveBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading
                ? <ActivityIndicator size="small" color={colors.white} />
                : <Text style={modal.saveBtnText}>Switch to {targetRole}</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={modal.closeBtn} onPress={onClose}>
            <Text style={modal.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Notifications Modal ──────────────────────────────────────────────────────
function NotificationsModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState({
    nearbyEvents: true,
    artistUpdates: true,
    eventReminders: true,
    newClips: false,
    rsvpReminders: true,
  });

  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  const rows = [
    { key: 'nearbyEvents', label: 'New events near you', sub: 'Shows added in your area' },
    { key: 'artistUpdates', label: 'Artist updates', sub: 'Posts from artists you follow' },
    { key: 'eventReminders', label: 'Event reminders', sub: '24 hours before show day' },
    { key: 'rsvpReminders', label: 'RSVP reminders', sub: 'For events requiring RSVP' },
    { key: 'newClips', label: 'New clips on Explore', sub: 'Videos for upcoming shows' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={modal.overlay} onPress={onClose}>
        <Pressable style={[modal.sheet, { paddingBottom: insets.bottom + 24 }]} onPress={() => {}}>
          <View style={modal.handle} />
          <Text style={modal.title}>Notifications</Text>

          {rows.map((row, i) => (
            <View key={row.key} style={[modal.toggleRow, i < rows.length - 1 && modal.toggleRowBorder]}>
              <View style={{ flex: 1 }}>
                <Text style={modal.toggleLabel}>{row.label}</Text>
                <Text style={modal.toggleSub}>{row.sub}</Text>
              </View>
              <Switch
                value={settings[row.key]}
                onValueChange={() => toggle(row.key)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          ))}

          <TouchableOpacity style={modal.closeBtn} onPress={onClose}>
            <Text style={modal.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Artist Events Section ────────────────────────────────────────────────────
function ArtistEventsSection({ events, onCreatePress }) {
  if (events.length === 0) {
    return (
      <View style={styles.artistEventsEmpty}>
        <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
        <Text style={styles.artistEventsEmptyTitle}>No events yet</Text>
        <Text style={styles.artistEventsEmptySub}>Tap the + button to create your first show</Text>
        <TouchableOpacity style={styles.createEventBtn} onPress={onCreatePress} activeOpacity={0.85}>
          <LinearGradient colors={['#C084FC', '#7B2FBE']} style={styles.createEventBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="add" size={18} color={colors.white} />
            <Text style={styles.createEventBtnText}>Create Event</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.artistEventsList}>
      {events.map((ev, i) => (
        <View key={ev.id} style={[styles.artistEventRow, i === events.length - 1 && { borderBottomWidth: 0 }]}>
          <View style={styles.artistEventDateBox}>
            <Text style={styles.artistEventDateText}>
              {ev.concert_date
                ? new Date(ev.concert_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '—'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.artistEventTitle} numberOfLines={1}>{ev.title}</Text>
            <Text style={styles.artistEventMeta} numberOfLines={1}>
              {ev.venue}{ev.area ? ` · ${ev.area}` : ''}
            </Text>
          </View>
          <View style={styles.artistEventGenreBadge}>
            <Text style={styles.artistEventGenreText}>{ev.genre ?? '—'}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Main Profile Screen ──────────────────────────────────────────────────────
export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, profile, updateProfile, signOut } = useAuth();
  const { savedEvents } = useSavedEvents();
  const [activeModal, setActiveModal] = useState(null);
  const [localProfile, setLocalProfile] = useState(null);
  const [artistStats, setArtistStats] = useState(null);
  const [artistEvents, setArtistEvents] = useState([]);

  const merged = { ...profile, ...localProfile };
  const isArtist = merged?.role === 'ARTIST';
  const displayName = merged?.name ?? 'User';

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const upcomingEvents = getUpcomingEvents();

  useEffect(() => {
    if (!user || !isArtist) return;
    fetchArtistStats(user.id).then(setArtistStats).catch(() => {});
    fetchArtistEvents(user.id).then(setArtistEvents).catch(() => {});
  }, [user?.id, isArtist]);

  const handleUpdateProfile = async (updates) => {
    await updateProfile(updates);
    setLocalProfile((prev) => ({ ...prev, ...updates }));
  };

  const confirmSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const switchLabel = isArtist ? 'Switch to Fan Account' : 'Switch to Music Account';
  const switchIcon  = isArtist ? 'musical-notes-outline' : 'mic-outline';

  const MENU = [
    { icon: 'person-outline',       label: 'Edit Profile',    key: 'editProfile' },
    { icon: 'location-outline',     label: 'Change Location', key: 'changeLocation' },
    { icon: 'notifications-outline',label: 'Notifications',   key: 'notifications' },
    { icon: switchIcon,             label: switchLabel,       key: 'switchAccount' },
    { icon: 'bar-chart-outline',    label: 'Analytics',       key: 'analytics' },
  ];

  const fanStats = [
    { num: '0',                            label: 'Following' },
    { num: String(upcomingEvents.length),  label: 'Events' },
    { num: String(savedEvents.length),     label: 'Saved' },
  ];

  const artistStatsList = [
    { num: String(artistStats?.eventsCount ?? 0), label: 'Shows' },
    { num: String(artistStats?.followers ?? 0),   label: 'Followers' },
    { num: String(artistStats?.clipsCount ?? 0),  label: 'Clips' },
  ];

  const statsToShow = isArtist ? artistStatsList : fanStats;

  return (
    <LinearGradient colors={['#1a0533', '#140329']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.headerTitle}>Profile</Text>

          {/* Profile card */}
          <View style={styles.profileCard}>
            <LinearGradient colors={[colors.primary, '#2D0A5C']} style={styles.avatarCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>

            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>

            <View style={styles.badgeRow}>
              {merged?.role && (
                <View style={styles.roleBadge}>
                  <Ionicons name={merged.role === 'ARTIST' ? 'mic' : 'musical-notes'} size={12} color={colors.primaryLight} />
                  <Text style={styles.roleBadgeText}>{merged.role}</Text>
                </View>
              )}
              {merged?.town && (
                <View style={styles.townBadge}>
                  <Ionicons name="location" size={12} color={colors.textMuted} />
                  <Text style={styles.townBadgeText}>{merged.town}, {merged.state}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Stats — tappable → Analytics */}
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Analytics')}>
            <View style={styles.statsRow}>
              {statsToShow.map((s, i, arr) => (
                <React.Fragment key={s.label}>
                  <View style={styles.stat}>
                    <Text style={styles.statNum}>{s.num}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                  {i < arr.length - 1 && <View style={styles.statSep} />}
                </React.Fragment>
              ))}
            </View>
          </TouchableOpacity>

          {/* Artist — My Events section */}
          {isArtist && (
            <View style={styles.artistEventsCard}>
              <View style={styles.artistEventsHeader}>
                <Text style={styles.artistEventsTitle}>My Shows</Text>
                <TouchableOpacity
                  style={styles.artistEventsAddBtn}
                  onPress={() => navigation.navigate('Post')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={18} color={colors.primaryLight} />
                  <Text style={styles.artistEventsAddText}>New</Text>
                </TouchableOpacity>
              </View>
              <ArtistEventsSection
                events={artistEvents}
                onCreatePress={() => navigation.navigate('Post')}
              />
            </View>
          )}

          {/* Menu */}
          <View style={styles.menu}>
            {MENU.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, i === MENU.length - 1 && styles.menuItemLast]}
                onPress={() => item.key === 'analytics' ? navigation.navigate('Analytics') : setActiveModal(item.key)}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon} size={17} color={colors.primaryLight} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Sign out */}
          <TouchableOpacity style={styles.signOutBtn} onPress={confirmSignOut} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color="#FF4757" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <EditProfileModal
        visible={activeModal === 'editProfile'}
        profile={merged}
        onClose={() => setActiveModal(null)}
        onSave={({ name }) => { if (name.trim()) handleUpdateProfile({ name: name.trim() }); }}
      />
      <ChangeLocationModal
        visible={activeModal === 'changeLocation'}
        profile={merged}
        onClose={() => setActiveModal(null)}
        onSave={handleUpdateProfile}
      />
      <SwitchAccountModal
        visible={activeModal === 'switchAccount'}
        profile={merged}
        onClose={() => setActiveModal(null)}
        onSwitch={(role) => handleUpdateProfile({ role })}
      />
      <NotificationsModal
        visible={activeModal === 'notifications'}
        onClose={() => setActiveModal(null)}
      />
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: colors.white, paddingTop: 6, marginBottom: 24 },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  avatarText: { fontSize: 32, fontWeight: '800', color: colors.white },
  profileName: { fontSize: 22, fontWeight: '700', color: colors.white, marginBottom: 4 },
  profileEmail: { fontSize: 14, color: colors.textMuted, marginBottom: 14 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(123,47,190,0.22)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(123,47,190,0.4)',
  },
  roleBadgeText: { color: colors.primaryLight, fontSize: 12, fontWeight: '600' },
  townBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  townBadgeText: { color: colors.textSecondary, fontSize: 12 },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: 20,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: colors.white },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  statSep: { width: 1, height: 36, backgroundColor: colors.border },
  menu: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: 16, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(123,47,190,0.18)',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  menuLabel: { flex: 1, color: colors.white, fontSize: 15, fontWeight: '500' },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(255,71,87,0.1)', borderRadius: 14, paddingVertical: 15,
    borderWidth: 1, borderColor: 'rgba(255,71,87,0.2)',
  },
  signOutText: { color: '#FF4757', fontSize: 16, fontWeight: '600' },

  // Artist events card
  artistEventsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: 20, overflow: 'hidden',
  },
  artistEventsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  artistEventsTitle: { color: colors.white, fontSize: 16, fontWeight: '700' },
  artistEventsAddBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(168,85,247,0.15)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)',
  },
  artistEventsAddText: { color: colors.primaryLight, fontSize: 13, fontWeight: '600' },

  artistEventsEmpty: {
    alignItems: 'center', gap: 8, paddingVertical: 28, paddingHorizontal: 20,
  },
  artistEventsEmptyTitle: { color: colors.white, fontSize: 15, fontWeight: '700' },
  artistEventsEmptySub: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  createEventBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 6 },
  createEventBtnGradient: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  createEventBtnText: { color: colors.white, fontSize: 14, fontWeight: '700' },

  artistEventsList: { overflow: 'hidden' },
  artistEventRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  artistEventDateBox: {
    width: 48, height: 48, borderRadius: 10,
    backgroundColor: 'rgba(168,85,247,0.12)',
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  artistEventDateText: { color: colors.primaryLight, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  artistEventTitle: { color: colors.white, fontSize: 14, fontWeight: '600' },
  artistEventMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  artistEventGenreBadge: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  artistEventGenreText: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#1E0642', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: colors.border, padding: 24, gap: 16,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '800', color: colors.white },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: -8 },
  field: { gap: 6 },
  fieldLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 11,
    color: colors.white, fontSize: 15,
  },
  readOnlyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  readOnlyText: { color: colors.textMuted, fontSize: 14 },
  saveBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  saveBtnGradient: { paddingVertical: 15, alignItems: 'center' },
  saveBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 13,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  closeBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  toggleRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  toggleLabel: { color: colors.white, fontSize: 14, fontWeight: '600' },
  toggleSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  switchNote: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  accountRow: { flexDirection: 'row', gap: 12 },
  accountCard: {
    flex: 1, alignItems: 'center', gap: 8, padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  accountCardActive: { borderColor: colors.primary, backgroundColor: 'rgba(123,47,190,0.15)' },
  accountCardLabel: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  accountCardSub: { color: colors.textMuted, fontSize: 11, textAlign: 'center' },
});
