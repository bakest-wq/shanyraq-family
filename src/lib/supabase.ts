import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { env } from '@/lib/env';
import type { Database } from '@/types/database';

let client: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!env.isSupabaseConfigured) {
    throw new Error('Supabase environment variables are missing.');
  }

  if (!client) {
    client = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  return client;
}

export function isSupabaseReady(): boolean {
  return env.isSupabaseConfigured;
}

/** Convenience alias used by services. */
export function supabase() {
  return getSupabaseClient();
}
