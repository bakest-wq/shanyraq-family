import { getSupabaseClient } from '@/lib/supabase';
import type { Relative } from '@/types/relative';
import { relativeToCreateInput } from '@/utils/family-backup-format';
import { mapRelativeToInsert } from '@/utils/relative.mapper';

/** Apply a saved graph snapshot to Supabase — two-pass link upsert (same as backup restore). */
export async function applyGraphSnapshot(familyId: string, relatives: Relative[]): Promise<number> {
  if (relatives.length === 0) {
    return 0;
  }

  const supabase = getSupabaseClient();

  const withoutLinks = relatives.map((relative) => {
    const payload = mapRelativeToInsert(relativeToCreateInput(relative), familyId);
    return {
      ...payload,
      id: relative.id,
      father_id: null,
      mother_id: null,
      spouse_id: null,
    };
  });

  const { error: firstPassError } = await supabase.from('relatives').upsert(withoutLinks, {
    onConflict: 'id',
  });

  if (firstPassError) {
    throw new Error(firstPassError.message);
  }

  for (const relative of relatives) {
    const { error } = await supabase
      .from('relatives')
      .update({
        father_id: relative.fatherId ?? null,
        mother_id: relative.motherId ?? null,
        spouse_id: relative.spouseId ?? null,
      })
      .eq('id', relative.id)
      .eq('family_id', familyId);

    if (error) {
      throw new Error(error.message);
    }
  }

  return relatives.length;
}
