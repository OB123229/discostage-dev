import { supabase } from '../lib/supabase';

async function getOrCreateArtist(userId, profileName) {
  const { data } = await supabase
    .from('artists')
    .select('id, name, followers')
    .eq('user_id', userId)
    .single();
  if (data) return data;

  const { data: created, error } = await supabase
    .from('artists')
    .insert({ user_id: userId, name: profileName ?? 'Artist' })
    .select()
    .single();
  if (error) throw error;
  return created;
}

export async function createEvent(userId, profileName, {
  title, venue, address, city, state, concertDate, time, genre, vibe, requireRsvp,
}) {
  const artist = await getOrCreateArtist(userId, profileName);
  const area = city && state ? `${city}, ${state}` : city || state || '';

  const { data, error } = await supabase
    .from('events')
    .insert({
      artist_id: artist.id,
      title,
      venue,
      address: address || null,
      area,
      concert_date: concertDate,
      time,
      genre,
      vibe: vibe || null,
      require_rsvp: requireRsvp,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchArtistStats(userId) {
  const { data: artist } = await supabase
    .from('artists')
    .select('id, followers')
    .eq('user_id', userId)
    .single();

  if (!artist) return { eventsCount: 0, followers: 0, clipsCount: 0 };

  const [{ count: eventsCount }, { count: clipsCount }] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('artist_id', artist.id),
    supabase.from('videos').select('*', { count: 'exact', head: true }).eq('artist_id', artist.id),
  ]);

  return {
    eventsCount: eventsCount ?? 0,
    followers: artist.followers ?? 0,
    clipsCount: clipsCount ?? 0,
  };
}

export async function fetchArtistEvents(userId) {
  const { data: artist } = await supabase
    .from('artists')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!artist) return [];

  const { data } = await supabase
    .from('events')
    .select('id, title, venue, area, concert_date, time, genre')
    .eq('artist_id', artist.id)
    .order('concert_date', { ascending: true });

  return data ?? [];
}
