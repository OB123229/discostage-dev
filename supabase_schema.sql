-- ============================================================
-- DiscoStage — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ARTISTS
create table if not exists public.artists (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete set null,
  name        text not null,
  genre       text,
  bio         text,
  color       text default '#2D1B69',
  verified    boolean default false,
  followers   int default 0,
  created_at  timestamptz default now()
);
alter table public.artists enable row level security;
create policy "Artists are public" on public.artists for select using (true);
create policy "Owner can manage artist" on public.artists for all using (auth.uid() = user_id);

-- EVENTS
create table if not exists public.events (
  id             uuid default gen_random_uuid() primary key,
  artist_id      uuid references public.artists on delete cascade,
  title          text not null,
  venue          text not null,
  address        text,
  area           text,
  concert_date   date not null,
  time           text,
  genre          text,
  vibe           text,
  color          text default '#2D1B69',
  venue_type     text,
  venue_details  jsonb default '{}',
  require_rsvp   boolean default false,
  rating         numeric(3,2) default 0,
  interested     int default 0,
  created_at     timestamptz default now()
);
alter table public.events enable row level security;
create policy "Events are public" on public.events for select using (true);
create policy "Authenticated users can create events" on public.events for insert with check (auth.role() = 'authenticated');

-- VIDEOS
create table if not exists public.videos (
  id            uuid default gen_random_uuid() primary key,
  uploader_id   uuid references auth.users on delete cascade not null,
  artist_id     uuid references public.artists on delete set null,
  genre         text,
  storage_path  text not null,
  video_url     text not null,
  likes         int default 0,
  views         int default 0,
  created_at    timestamptz default now()
);
alter table public.videos enable row level security;
create policy "Videos are public" on public.videos for select using (true);
create policy "Uploader can insert" on public.videos for insert with check (auth.uid() = uploader_id);
create policy "Uploader can delete" on public.videos for delete using (auth.uid() = uploader_id);

-- VIDEO LIKES
create table if not exists public.video_likes (
  user_id   uuid references auth.users on delete cascade,
  video_id  uuid references public.videos on delete cascade,
  primary key (user_id, video_id)
);
alter table public.video_likes enable row level security;
create policy "Users manage own likes" on public.video_likes for all using (auth.uid() = user_id);

-- SAVED EVENTS
create table if not exists public.saved_events (
  user_id   uuid references auth.users on delete cascade,
  event_id  uuid references public.events on delete cascade,
  primary key (user_id, event_id)
);
alter table public.saved_events enable row level security;
create policy "Users manage own saved events" on public.saved_events for all using (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET
-- Run separately or via Dashboard → Storage → New Bucket
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('videos', 'videos', true);
-- create policy "Public video read" on storage.objects for select using (bucket_id = 'videos');
-- create policy "Auth users can upload" on storage.objects for insert with check (bucket_id = 'videos' and auth.role() = 'authenticated');
-- create policy "Uploader can delete" on storage.objects for delete using (bucket_id = 'videos' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- HELPER FUNCTION — videos within 2-week show window
-- ============================================================
create or replace function public.get_upcoming_videos()
returns table (
  id            uuid,
  uploader_id   uuid,
  artist_id     uuid,
  genre         text,
  video_url     text,
  likes         int,
  views         int,
  created_at    timestamptz,
  artist_name   text,
  artist_color  text,
  concert_date  date,
  event_title   text,
  venue_name    text
)
language sql
security definer
as $$
  select
    v.id,
    v.uploader_id,
    v.artist_id,
    v.genre,
    v.video_url,
    v.likes,
    v.views,
    v.created_at,
    a.name  as artist_name,
    a.color as artist_color,
    e.concert_date,
    e.title as event_title,
    e.venue as venue_name
  from public.videos v
  join public.artists a on a.id = v.artist_id
  join public.events  e on e.artist_id = a.id
  where e.concert_date between current_date and current_date + interval '14 days'
  order by v.created_at desc;
$$;
