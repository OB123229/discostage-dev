import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// SUPABASE SETUP REQUIRED:
// Run this SQL in your Supabase dashboard (SQL Editor):
//
// create table public.profiles (
//   id uuid references auth.users on delete cascade primary key,
//   name text,
//   role text check (role in ('FAN', 'ARTIST')),
//   town text,
//   state text,
//   created_at timestamptz default now()
// );
//
// alter table public.profiles enable row level security;
// create policy "Users can manage their own profile"
//   on public.profiles for all using (auth.uid() = id);
//
// Also disable email confirmation in:
// Supabase Dashboard → Authentication → Providers → Email → Confirm email: OFF

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const nextUser = session?.user ?? null;
        setUser(nextUser);
        if (nextUser) {
          await loadProfile(nextUser.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(data ?? null);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
    return data; // { user, session }
  };

  const createProfile = async (userId, { name, role, town, state }) => {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, name, role, town, state });
    if (error) throw error;
    await loadProfile(userId);
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    if (error) throw error;
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, createProfile, updateProfile, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
