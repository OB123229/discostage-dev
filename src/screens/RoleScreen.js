import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';

const ROLES = [
  {
    id: 'FAN',
    label: 'Music Fan',
    icon: 'musical-notes',
    description: 'Discover emerging artists and local shows near you',
    perks: ['Browse event feed', 'Follow artists', 'Get show alerts'],
  },
  {
    id: 'ARTIST',
    label: 'Artist',
    icon: 'mic',
    description: 'Promote your music and connect with local fans',
    perks: ['Create & promote events', 'Artist profile page', 'Fan analytics'],
  },
];

export default function RoleScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signUp, createProfile } = useAuth();
  const { draft, clearDraft } = useOnboarding();

  const handleGo = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const data = await signUp(draft.email, draft.password, draft.name);
      const userId = data.user?.id;
      if (!userId) {
        Alert.alert(
          'Check Your Email',
          'We sent a confirmation link. Confirm your email then sign in.',
        );
        clearDraft();
        navigation.navigate('Auth', { mode: 'signin' });
        return;
      }
      await createProfile(userId, {
        name: draft.name,
        role: selected,
        town: draft.town,
        state: draft.state,
      });
      clearDraft();
      // Auth state updates → navigator switches to Main automatically
    } catch (e) {
      Alert.alert('Registration Failed', e.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1a0533', '#2D0A5C', '#1a0533']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.dots}>
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={[styles.dot, i < 3 && styles.dotDone, i === 3 && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        <Text style={styles.title}>I want to...</Text>
        <Text style={styles.subtitle}>Choose how you'll use Discover Stage</Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {ROLES.map((role) => {
            const active = selected === role.id;
            return (
              <TouchableOpacity
                key={role.id}
                style={[styles.card, active && styles.cardActive]}
                onPress={() => setSelected(role.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                  <Ionicons
                    name={role.icon}
                    size={30}
                    color={active ? colors.white : colors.primary}
                  />
                </View>
                <Text style={[styles.roleLabel, active && styles.roleLabelActive]}>
                  {role.label}
                </Text>
                <Text style={styles.roleDesc}>{role.description}</Text>
                <View style={styles.perks}>
                  {role.perks.map((perk) => (
                    <View key={perk} style={styles.perkRow}>
                      <Ionicons
                        name="checkmark"
                        size={13}
                        color={active ? colors.primaryLight : colors.textMuted}
                      />
                      <Text style={[styles.perkText, active && styles.perkTextActive]}>
                        {perk}
                      </Text>
                    </View>
                  ))}
                </View>
                {active && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.goBtn, (!selected || loading) && styles.goBtnDisabled]}
            onPress={handleGo}
            disabled={!selected || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.goBtnText}>Let's Go →</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 28,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotDone: { backgroundColor: colors.primary },
  dotActive: { width: 22, backgroundColor: colors.primaryLight },
  title: { fontSize: 30, fontWeight: '800', color: colors.white, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 24 },
  scroll: { gap: 14, paddingBottom: 110 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    position: 'relative',
  },
  cardActive: {
    backgroundColor: 'rgba(123,47,190,0.15)',
    borderColor: colors.primary,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: 'rgba(123,47,190,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconWrapActive: { backgroundColor: colors.primary },
  roleLabel: { fontSize: 20, fontWeight: '700', color: colors.white, marginBottom: 6 },
  roleLabelActive: { color: colors.primaryLight },
  roleDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 14 },
  perks: { gap: 7 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  perkText: { fontSize: 13, color: colors.textMuted },
  perkTextActive: { color: colors.textSecondary },
  checkBadge: { position: 'absolute', top: 16, right: 16 },
  footer: { position: 'absolute', bottom: 36, left: 24, right: 24 },
  goBtn: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  goBtnDisabled: { opacity: 0.35 },
  goBtnText: { color: colors.primary, fontSize: 17, fontWeight: '700' },
});
