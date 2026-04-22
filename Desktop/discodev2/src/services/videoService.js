import { supabase } from '../lib/supabase';

// ─── Fetch videos for the Explore feed ───────────────────────────────────────
// Tries the 2-week show-window RPC first. If that returns nothing (no events
// in DB yet), falls back to fetching all uploaded videos directly.
export async function fetchUpcomingVideos() {
  // Fetch videos with artist info joined
  const { data, error } = await supabase
    .from('videos')
    .select(`
      id, uploader_id, artist_id, genre, video_url, likes, views, created_at,
      artist_name,
      artists ( id, name, color )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  const videos = data ?? [];

  // Fetch uploader display names separately (no FK relationship for auto-join)
  const uploaderIds = [...new Set(videos.map(v => v.uploader_id).filter(Boolean))];
  let uploaderNames = {};
  if (uploaderIds.length > 0) {
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', uploaderIds);
    (profilesData ?? []).forEach(p => { uploaderNames[p.id] = p.name; });
  }

  // Fetch next upcoming event for each linked artist
  const artistIds = [...new Set(videos.filter(v => v.artist_id).map(v => v.artist_id))];
  let eventsByArtist = {};
  if (artistIds.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const { data: events } = await supabase
      .from('events')
      .select('artist_id, title, venue, concert_date')
      .in('artist_id', artistIds)
      .gte('concert_date', today)
      .order('concert_date', { ascending: true });
    (events ?? []).forEach(e => {
      if (!eventsByArtist[e.artist_id]) eventsByArtist[e.artist_id] = e;
    });
  }

  return videos.map(v => {
    const event = v.artist_id ? eventsByArtist[v.artist_id] : null;
    return {
      ...v,
      artist_name: v.artists?.name ?? v.artist_name ?? null,
      artist_color: v.artists?.color ?? null,
      uploader_display_name: uploaderNames[v.uploader_id] ?? null,
      concert_date: event?.concert_date ?? null,
      event_title: event?.title ?? null,
      venue_name: event?.venue ?? null,
    };
  });
}

// Check if a string is a valid UUID (real Supabase ID vs mock '1', '2' etc.)
function isUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// ─── Upload a video file to storage + insert metadata row ────────────────────
export async function uploadVideo({ uri, mimeType, artistId, artistName, genre, uploaderId }) {
  const ext = uri.split('.').pop() || 'mp4';
  const storagePath = `${uploaderId}/${Date.now()}.${ext}`;

  // Read the local file as an ArrayBuffer using XHR (fetch blob/arrayBuffer unreliable on RN)
  const arrayBuffer = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new Error('Failed to read video file'));
    xhr.open('GET', uri);
    xhr.send();
  });
  console.log('[upload] arrayBuffer size:', arrayBuffer?.byteLength, 'uri:', uri);

  // Upload to Supabase Storage bucket "videos"
  const { error: storageError } = await supabase.storage
    .from('videos')
    .upload(storagePath, arrayBuffer, {
      contentType: mimeType || 'video/quicktime',
      upsert: false,
    });
  if (storageError) throw storageError;

  // Build the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('videos')
    .getPublicUrl(storagePath);

  // Insert metadata into the videos table
  const { data, error: insertError } = await supabase
    .from('videos')
    .insert({
      uploader_id: uploaderId,
      artist_id: isUUID(artistId) ? artistId : null,
      artist_name: artistName ?? null,
      genre,
      storage_path: storagePath,
      video_url: publicUrl,
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return data;
}

// ─── Delete a video (uploader only) ──────────────────────────────────────────
export async function deleteVideo(videoId, storagePath) {
  if (storagePath) {
    await supabase.storage.from('videos').remove([storagePath]);
  }
  const { error } = await supabase.from('videos').delete().eq('id', videoId);
  if (error) throw error;
}

// ─── Toggle like on a video ───────────────────────────────────────────────────
export async function toggleVideoLike(videoId, userId) {
  // Check if like already exists
  const { data: existing } = await supabase
    .from('video_likes')
    .select('video_id')
    .eq('user_id', userId)
    .eq('video_id', videoId)
    .single();

  if (existing) {
    await supabase
      .from('video_likes')
      .delete()
      .eq('user_id', userId)
      .eq('video_id', videoId);
    // Decrement count
    await supabase.rpc('decrement_video_likes', { vid: videoId });
    return false; // unliked
  } else {
    await supabase
      .from('video_likes')
      .insert({ user_id: userId, video_id: videoId });
    // Increment count
    await supabase.rpc('increment_video_likes', { vid: videoId });
    return true; // liked
  }
}

// ─── Increment view count ─────────────────────────────────────────────────────
export async function incrementVideoViews(videoId) {
  await supabase.rpc('increment_video_views', { vid: videoId });
}

// ─── Fetch artists (for upload search) ───────────────────────────────────────
export async function fetchArtists() {
  const { data, error } = await supabase
    .from('artists')
    .select('id, name, genre, color, followers')
    .order('name');
  if (error) throw error;
  return data ?? [];
}
