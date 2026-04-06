import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { TOWNS } from '../data/mockData';
import { useOnboarding } from '../context/OnboardingContext';

function ProgressDots({ step }) {
  return (
    <View style={styles.dots}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i < step && styles.dotDone,
            i === step && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );
}

export default function LocationScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const { updateDraft } = useOnboarding();

  const filtered = TOWNS.filter((t) =>
    `${t.city} ${t.state}`.toLowerCase().includes(query.toLowerCase())
  );

  const handleContinue = () => {
    if (!selected) return;
    updateDraft({ town: selected.city, state: selected.state });
    navigation.navigate('Role');
  };

  return (
    <LinearGradient colors={['#1a0533', '#2D0A5C', '#1a0533']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <ProgressDots step={2} />
        </View>

        <Text style={styles.title}>Where do you{'\n'}discover music?</Text>
        <Text style={styles.subtitle}>Pick your college town</Text>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={17} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cities..."
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

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => `${item.city}-${item.state}`}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const active = selected?.city === item.city && selected?.state === item.state;
            return (
              <TouchableOpacity
                style={[styles.townRow, active && styles.townRowActive]}
                onPress={() => setSelected(item)}
                activeOpacity={0.75}
              >
                <View style={styles.townLeft}>
                  <Ionicons
                    name="location"
                    size={17}
                    color={active ? colors.primaryLight : colors.textMuted}
                    style={{ marginRight: 12 }}
                  />
                  <View>
                    <Text style={[styles.townCity, active && styles.townCityActive]}>
                      {item.city}
                    </Text>
                    <Text style={styles.townState}>{item.state}</Text>
                  </View>
                </View>
                {active && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          }}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={!selected}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
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
    marginBottom: 32,
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
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotDone: { backgroundColor: colors.primary },
  dotActive: { width: 22, backgroundColor: colors.primaryLight },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 38,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 24 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  searchInput: { flex: 1, paddingVertical: 14, color: colors.white, fontSize: 16 },
  list: { paddingBottom: 110 },
  townRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 8,
  },
  townRowActive: {
    backgroundColor: 'rgba(123,47,190,0.18)',
    borderColor: colors.primary,
  },
  townLeft: { flexDirection: 'row', alignItems: 'center' },
  townCity: { color: colors.white, fontSize: 16, fontWeight: '600' },
  townCityActive: { color: colors.primaryLight },
  townState: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  footer: { position: 'absolute', bottom: 36, left: 24, right: 24 },
  continueBtn: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  continueBtnDisabled: { opacity: 0.35 },
  continueBtnText: { color: colors.primary, fontSize: 17, fontWeight: '700' },
});
