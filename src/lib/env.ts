const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

export const env = {
  supabaseUrl,
  supabaseAnonKey,
  isSupabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
} as const;

export function assertSupabaseConfigured(): void {
  if (!env.isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file.',
    );
  }
}
