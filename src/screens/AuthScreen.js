import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useOnboarding } from '../context/OnboardingContext';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen({ navigation, route }) {
  const initialMode = route.params?.mode ?? 'signup';
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { updateDraft } = useOnboarding();
  const { signIn } = useAuth();

  const switchMode = (m) => {
    setMode(m);
    setError('');
  };

  const validate = () => {
    if (mode === 'signup' && !name.trim()) return 'Name is required';
    if (!email.trim() || !email.includes('@')) return 'Enter a valid email';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email.trim().toLowerCase(), password);
        // auth state change drives navigation
      } else {
        updateDraft({ name: name.trim(), email: email.trim().toLowerCase(), password });
        navigation.navigate('Location');
      }
    } catch (e) {
      setError(e.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1a0533', '#2D0A5C', '#1a0533']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color={colors.white} />
            </TouchableOpacity>

            <Text style={styles.heading}>
              {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.subheading}>
              {mode === 'signup'
                ? 'Join the underground music scene'
                : 'Good to see you again'}
            </Text>

            {/* Tab switcher */}
            <View style={styles.tabRow}>
              {['signup', 'signin'].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.tab, mode === m && styles.tabActive]}
                  onPress={() => switchMode(m)}
                >
                  <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                    {m === 'signup' ? 'Sign Up' : 'Sign In'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Form */}
            <View style={styles.form}>
              {mode === 'signup' && (
                <View style={styles.field}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@email.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.pwWrap}>
                  <TextInput
                    style={[styles.input, { flex: 1, paddingRight: 50 }]}
                    placeholder="Min. 8 characters"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {!!error && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={15} color={colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {mode === 'signup' ? 'Continue →' : 'Sign In'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40 },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  heading: { fontSize: 32, fontWeight: '800', color: colors.white, marginBottom: 8 },
  subheading: { fontSize: 16, color: colors.textSecondary, marginBottom: 32 },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontWeight: '600', fontSize: 15 },
  tabTextActive: { color: colors.white },
  form: { gap: 16 },
  field: { gap: 8 },
  label: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: colors.white,
    fontSize: 16,
  },
  pwWrap: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: [{ translateY: -11 }],
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,68,68,0.12)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.25)',
  },
  errorText: { color: colors.error, fontSize: 14, flex: 1 },
  submitBtn: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.65 },
  submitBtnText: { color: colors.primary, fontSize: 17, fontWeight: '700' },
});
