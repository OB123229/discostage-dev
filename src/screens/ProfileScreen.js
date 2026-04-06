import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const MENU = [
  { icon: 'person-outline', label: 'Edit Profile' },
  { icon: 'notifications-outline', label: 'Notifications' },
  { icon: 'heart-outline', label: 'Saved Events' },
  { icon: 'ticket-outline', label: 'My Events' },
  { icon: 'help-circle-outline', label: 'Help & Support' },
  { icon: 'shield-outline', label: 'Privacy & Terms' },
];

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();

  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : (user?.email?.[0] ?? 'U').toUpperCase();

  const confirmSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <LinearGradient colors={['#1a0533', '#140329']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.headerTitle}>Profile</Text>

          {/* Profile card */}
          <View style={styles.profileCard}>
            <LinearGradient
              colors={[colors.primary, '#2D0A5C']}
              style={styles.avatarCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>

            <Text style={styles.profileName}>{profile?.name ?? 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>

            <View style={styles.badgeRow}>
              {profile?.role && (
                <View style={styles.roleBadge}>
                  <Ionicons
                    name={profile.role === 'ARTIST' ? 'mic' : 'musical-notes'}
                    size={12}
                    color={colors.primaryLight}
                  />
                  <Text style={styles.roleBadgeText}>{profile.role}</Text>
                </View>
              )}
              {profile?.town && (
                <View style={styles.townBadge}>
                  <Ionicons name="location" size={12} color={colors.textMuted} />
                  <Text style={styles.townBadgeText}>
                    {profile.town}, {profile.state}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { num: '0', label: 'Following' },
              { num: '0', label: 'Events' },
              { num: '0', label: 'Saved' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{s.num}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
                {i < arr.length - 1 && <View style={styles.statSep} />}
              </React.Fragment>
            ))}
          </View>

          {/* Menu */}
          <View style={styles.menu}>
            {MENU.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, i === MENU.length - 1 && styles.menuItemLast]}
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    paddingTop: 6,
    marginBottom: 24,
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: colors.white },
  profileName: { fontSize: 22, fontWeight: '700', color: colors.white, marginBottom: 4 },
  profileEmail: { fontSize: 14, color: colors.textMuted, marginBottom: 14 },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(123,47,190,0.22)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(123,47,190,0.4)',
  },
  roleBadgeText: { color: colors.primaryLight, fontSize: 12, fontWeight: '600' },
  townBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  townBadgeText: { color: colors.textSecondary, fontSize: 12 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: colors.white },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  statSep: { width: 1, height: 36, backgroundColor: colors.border },
  menu: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(123,47,190,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLabel: { flex: 1, color: colors.white, fontSize: 15, fontWeight: '500' },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,71,87,0.1)',
    borderRadius: 14,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,71,87,0.2)',
  },
  signOutText: { color: '#FF4757', fontSize: 16, fontWeight: '600' },
});
