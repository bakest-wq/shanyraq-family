/**
 * Future Supabase access helpers.
 * RLS policies are open in development — see supabase/rls-future.sql before production.
 */

export type SupabaseAccessContext = {
  familyId: string;
  memberId?: string;
  relativeId?: string | null;
  role: 'owner' | 'member';
};

/** Placeholder for auth-aware queries once Supabase Auth is wired. */
export function buildSupabaseAccessContext(input: SupabaseAccessContext): SupabaseAccessContext {
  return input;
}
