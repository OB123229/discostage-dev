import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient
      colors={['#1a0533', '#2D0A5C', '#1a0533']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.safe}>
        {/* Decorative blobs */}
        <View style={[styles.blob, styles.blob1]} />
        <View style={[styles.blob, styles.blob2]} />

        {/* Logo */}
        <View style={styles.logoWrap}>
          <Image
            source={require('../../Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Text */}
        <View style={styles.textWrap}>
          <Text style={styles.title}>Discover Stage</Text>
          <Text style={styles.subtitle}>
            Find local music{'\n'}before it goes mainstream
          </Text>
        </View>

        {/* Tags */}
        <View style={styles.tags}>
          {['Live Music', 'College Towns', 'Emerging Artists'].map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Auth', { mode: 'signup' })}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => navigation.navigate('Auth', { mode: 'signin' })}
            activeOpacity={0.85}
          >
            <Text style={styles.outlineBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, alignItems: 'center', paddingHorizontal: 28 },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.primary,
    opacity: 0.12,
  },
  blob1: { width: 340, height: 340, top: -100, right: -100 },
  blob2: { width: 220, height: 220, bottom: 80, left: -80 },
  logoWrap: {
    marginTop: 72,
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: 'rgba(123,47,190,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(123,47,190,0.35)',
  },
  logo: { width: 96, height: 96 },
  textWrap: { marginTop: 32, alignItems: 'center' },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 26,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
  },
  tag: {
    backgroundColor: 'rgba(123,47,190,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(123,47,190,0.4)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tagText: { color: colors.primaryLight, fontSize: 13, fontWeight: '600' },
  buttons: {
    position: 'absolute',
    bottom: 44,
    left: 28,
    right: 28,
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  primaryBtnText: { color: colors.primary, fontSize: 17, fontWeight: '700' },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  outlineBtnText: { color: colors.white, fontSize: 17, fontWeight: '600' },
});
