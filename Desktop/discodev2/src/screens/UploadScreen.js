import React, { useState, useMemo, useEffect } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { GENRES, ARTISTS } from '../data/mockData';
import { uploadVideo, fetchArtists } from '../services/videoService';
import { useAuth } from '../context/AuthContext';

const GENRE_OPTIONS = GENRES.filter((g) => g !== 'All');

export default function UploadScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [videoAsset, setVideoAsset] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistQuery, setArtistQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [posted, setPosted] = useState(false);
  const [artists, setArtists] = useState(ARTISTS); // start with mock, replace with real

  // Try to load real artists from Supabase
  useEffect(() => {
    fetchArtists()
      .then((data) => { if (data.length > 0) setArtists(data); })
      .catch(() => {}); // silently fall back to mock
  }, []);

  const filteredArtists = useMemo(() => {
    const q = artistQuery.trim().toLowerCase();
    if (!q) return artists;
    return artists.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.genre ?? '').toLowerCase().includes(q)
    );
  }, [artistQuery, artists]);

  const canPost = videoAsset && selectedArtist && selectedGenre;

  // ─── Pick video from library ───────────────────────────────────────────────
  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to select a video.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets?.[0]) {
      setVideoAsset(result.assets[0]);
    }
  };

  // ─── Upload + post ─────────────────────────────────────────────────────────
  const handlePost = async () => {
    if (!canPost || uploading) return;
    setUploading(true);
    try {
      await uploadVideo({
        uri: videoAsset.uri,
        mimeType: videoAsset.mimeType,
        artistId: selectedArtist.id,
        artistName: selectedArtist.name,
        genre: selectedGenre,
        uploaderId: user.id,
      });
      setPosted(true);
      setTimeout(() => {
        setPosted(false);
        setVideoAsset(null);
        setSelectedArtist(null);
        setArtistQuery('');
        setSelectedGenre(null);
        navigation.navigate('Explore');
      }, 1600);
    } catch (err) {
      Alert.alert('Upload failed', err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <LinearGradient colors={['#1a0533', '#2D0A5C', '#140329']} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={26} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post a Clip</Text>
          <TouchableOpacity
            style={[styles.postBtn, !canPost && styles.postBtnDisabled]}
            onPress={handlePost}
            disabled={!canPost || uploading}
          >
            {uploading
              ? <ActivityIndicator size="small" color={colors.white} />
              : <Text style={styles.postBtnText}>Post</Text>
            }
          </TouchableOpacity>
        </View>

        {posted ? (
          <View style={styles.successWrap}>
            <Ionicons name="checkmark-circle" size={64} color={colors.primaryLight} />
            <Text style={styles.successTitle}>Clip posted!</Text>
            <Text style={styles.successSub}>Your video is live on Explore</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Video picker */}
            <TouchableOpacity
              style={[styles.picker, videoAsset && styles.pickerSelected]}
              onPress={pickVideo}
              activeOpacity={0.8}
            >
              {videoAsset ? (
                <>
                  <LinearGradient
                    colors={['#2D1B69', '#1a0533']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0.3, y: 0 }}
                    end={{ x: 0.7, y: 1 }}
                  />
                  <View style={styles.pickerSelectedInner}>
                    <Ionicons name="videocam" size={36} color={colors.primaryLight} />
                    <Text style={styles.pickerSelectedText}>Video selected</Text>
                    <Text style={styles.pickerChangeText} numberOfLines={1}>
                      {videoAsset.fileName ?? 'Tap to change'}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.pickerDashedBorder} />
                  <View style={styles.pickerInner}>
                    <View style={styles.pickerIconWrap}>
                      <Ionicons name="cloud-upload-outline" size={32} color={colors.primaryLight} />
                    </View>
                    <Text style={styles.pickerTitle}>Select a video</Text>
                    <Text style={styles.pickerSub}>MP4 · MOV · up to 3 min</Text>
                  </View>
                </>
              )}
            </TouchableOpacity>

            {/* Link video to artist */}
            <View style={styles.section}>
              <Text style={styles.label}>Link video to artist</Text>
              <Text style={styles.labelSub}>Search for the band or artist this clip is for</Text>

              {selectedArtist ? (
                <View style={styles.selectedPill}>
                  <View style={[styles.artistAvatar, { backgroundColor: selectedArtist.color ?? colors.primary }]}>
                    <Text style={styles.artistAvatarLetter}>{selectedArtist.name[0]}</Text>
                  </View>
                  <Text style={styles.selectedPillText}>{selectedArtist.name}</Text>
                  <TouchableOpacity
                    onPress={() => { setSelectedArtist(null); setArtistQuery(''); }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.searchWrap}>
                    <Ionicons name="search-outline" size={16} color={colors.textMuted} style={{ marginLeft: 12 }} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search artists..."
                      placeholderTextColor={colors.textMuted}
                      value={artistQuery}
                      onChangeText={setArtistQuery}
                      autoCorrect={false}
                    />
                    {artistQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setArtistQuery('')} style={{ marginRight: 10 }}>
                        <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.resultList}>
                    {filteredArtists.length === 0 ? (
                      <View style={styles.noResults}>
                        <Text style={styles.noResultsText}>No artists found</Text>
                      </View>
                    ) : (
                      filteredArtists.map((artist, i) => (
                        <TouchableOpacity
                          key={artist.id}
                          style={[
                            styles.resultRow,
                            i === filteredArtists.length - 1 && { borderBottomWidth: 0 },
                          ]}
                          onPress={() => { setSelectedArtist(artist); setArtistQuery(''); }}
                          activeOpacity={0.8}
                        >
                          <View style={[styles.artistAvatar, { backgroundColor: artist.color ?? colors.primary }]}>
                            <Text style={styles.artistAvatarLetter}>{artist.name[0]}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.resultName}>{artist.name}</Text>
                            <Text style={styles.resultMeta}>
                              {artist.genre}{artist.followers ? ` · ${Number(artist.followers).toLocaleString()} fans` : ''}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                </>
              )}
            </View>

            {/* Genre */}
            <View style={styles.section}>
              <Text style={styles.label}>Genre</Text>
              <Text style={styles.labelSub}>Tag this clip so it reaches the right crowd</Text>
              <View style={styles.genreGrid}>
                {GENRE_OPTIONS.map((g) => {
                  const active = selectedGenre === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[styles.genreChip, active && styles.genreChipActive]}
                      onPress={() => setSelectedGenre(active ? null : g)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.genreChipText, active && styles.genreChipTextActive]}>{g}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Post button */}
            <TouchableOpacity
              style={[styles.postBtnLarge, !canPost && styles.postBtnLargeDisabled]}
              onPress={handlePost}
              disabled={!canPost || uploading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={canPost ? ['#C084FC', '#7B2FBE'] : ['#3D1A70', '#3D1A70']}
                style={styles.postBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={20} color={canPost ? colors.white : colors.textMuted} />
                    <Text style={[styles.postBtnLargeText, !canPost && { color: colors.textMuted }]}>
                      Post Clip
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
  postBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 7,
    minWidth: 58,
    alignItems: 'center',
  },
  postBtnDisabled: { backgroundColor: 'rgba(123,47,190,0.3)' },
  postBtnText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  scroll: { paddingHorizontal: 20, paddingTop: 24, gap: 28 },

  // Picker
  picker: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerSelected: { backgroundColor: '#1a0533' },
  pickerDashedBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(168,85,247,0.35)',
    borderStyle: 'dashed',
  },
  pickerInner: { alignItems: 'center', gap: 10 },
  pickerIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(168,85,247,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  pickerTitle: { color: colors.white, fontSize: 16, fontWeight: '700' },
  pickerSub: { color: colors.textMuted, fontSize: 13 },
  pickerSelectedInner: { alignItems: 'center', gap: 8, paddingHorizontal: 20 },
  pickerSelectedText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  pickerChangeText: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },

  // Section
  section: { gap: 10 },
  label: { color: colors.white, fontSize: 15, fontWeight: '700' },
  labelSub: { color: colors.textMuted, fontSize: 13, marginTop: -4 },

  // Artist search
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    padding: 10,
  },
  selectedPillText: { flex: 1, color: colors.white, fontSize: 14, fontWeight: '600' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    paddingVertical: 11,
    paddingRight: 4,
  },
  resultList: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultName: { color: colors.white, fontSize: 14, fontWeight: '600' },
  resultMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  noResults: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  noResultsText: { color: colors.textMuted, fontSize: 14 },
  artistAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistAvatarLetter: { color: colors.white, fontSize: 16, fontWeight: '800' },

  // Genre grid
  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  genreChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  genreChipText: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  genreChipTextActive: { color: colors.white, fontWeight: '700' },

  // Post button
  postBtnLarge: { borderRadius: 16, overflow: 'hidden' },
  postBtnLargeDisabled: { opacity: 0.5 },
  postBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  postBtnLargeText: { color: colors.white, fontSize: 16, fontWeight: '700' },

  // Success
  successWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  successTitle: { color: colors.white, fontSize: 24, fontWeight: '800' },
  successSub: { color: colors.textMuted, fontSize: 15 },
});
