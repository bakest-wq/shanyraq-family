import { getSupabaseClient } from '@/lib/supabase';
import { enrichRelativesWithLocalPhotos } from '@/utils/relative-photo-local';
import { CreateRelativeInput, ConnectParentsInput, Relative } from '@/types/relative';
import {
  getChildrenLinkedToParent,
  ParentLinkRole,
} from '@/utils/family-child-links';
import { areSharedParentSiblings } from '@/utils/family-sibling-links';
import {
  mapRelativeRow,
  mapRelativeToInsert,
  mapRelativeToUpdate,
} from '@/utils/relative.mapper';
import {
  buildLinkSyncPatches,
  FamilyLinkSnapshot,
  linksFromInput,
  linksFromRelative,
  snapshotsEqual,
} from '@/utils/relationship-sync';
import {
  assessSafeDelete,
  buildShezhireRepairPlan,
  collectRepairPatches,
  DeleteBlockedError,
  type ShezhireRepairKind,
} from '@/services/graph-integrity.service';

function handleSupabaseError(error: { message: string } | null, fallback: string): never {
  throw new Error(error?.message ?? fallback);
}

type PatchRelativeLinksOptions = {
  skipSync?: boolean;
};

async function fetchAllRelatives(familyId: string): Promise<Relative[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('relatives')
    .select('*')
    .eq('family_id', familyId)
    .order('full_name', { ascending: true });

  if (error) {
    handleSupabaseError(error, 'Failed to load relatives.');
  }

  return enrichRelativesWithLocalPhotos((data ?? []).map(mapRelativeRow));
}

async function fetchRelativeById(id: string, familyId: string): Promise<Relative | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('relatives')
    .select('*')
    .eq('id', id)
    .eq('family_id', familyId)
    .maybeSingle();

  if (error) {
    handleSupabaseError(error, 'Failed to load relative.');
  }

  if (!data) {
    return null;
  }

  const [relative] = await enrichRelativesWithLocalPhotos([mapRelativeRow(data)]);
  return relative ?? null;
}

async function patchRelativeLinksRaw(
  id: string,
  patch: Partial<ConnectParentsInput>,
  familyId: string,
): Promise<Relative> {
  const supabase = getSupabaseClient();
  const row: {
    father_id?: string | null;
    mother_id?: string | null;
    spouse_id?: string | null;
  } = {};

  if (patch.fatherId !== undefined) {
    row.father_id = patch.fatherId;
  }

  if (patch.motherId !== undefined) {
    row.mother_id = patch.motherId;
  }

  if (patch.spouseId !== undefined) {
    row.spouse_id = patch.spouseId;
  }

  if (Object.keys(row).length === 0) {
    const existing = await fetchRelativeById(id, familyId);
    if (!existing) {
      throw new Error('Relative not found.');
    }

    return existing;
  }

  const { data, error } = await supabase
    .from('relatives')
    .update(row)
    .eq('id', id)
    .eq('family_id', familyId)
    .select('*')
    .single();

  if (error) {
    handleSupabaseError(error, 'Failed to update family links.');
  }

  const [relative] = await enrichRelativesWithLocalPhotos([mapRelativeRow(data)]);
  return relative;
}

async function applyLinkSync(
  subjectId: string,
  before: FamilyLinkSnapshot | null,
  after: FamilyLinkSnapshot,
  familyId: string,
  relatives: Relative[],
): Promise<number> {
  let workingRelatives = relatives;
  let appliedCount = 0;
  let previousSnapshot = after;

  for (let pass = 0; pass < 3; pass += 1) {
    const patches = buildLinkSyncPatches(subjectId, before, previousSnapshot, workingRelatives);
    if (patches.length === 0) {
      break;
    }

    for (const { personId, patch } of patches) {
      await patchRelativeLinksRaw(personId, patch, familyId);
      appliedCount += 1;
    }

    workingRelatives = await fetchAllRelatives(familyId);
    const subject = workingRelatives.find((relative) => relative.id === subjectId);
    if (!subject) {
      break;
    }

    const nextSnapshot = linksFromRelative(subject);
    if (snapshotsEqual(previousSnapshot, nextSnapshot)) {
      break;
    }

    before = previousSnapshot;
    previousSnapshot = nextSnapshot;
  }

  return appliedCount;
}

export const relativesService = {
  async getAll(familyId: string): Promise<Relative[]> {
    return fetchAllRelatives(familyId);
  },

  async getById(id: string, familyId: string): Promise<Relative | null> {
    return fetchRelativeById(id, familyId);
  },

  async create(input: CreateRelativeInput, familyId: string): Promise<Relative> {
    const supabase = getSupabaseClient();
    const payload = mapRelativeToInsert(input, familyId);

    const { data, error } = await supabase.from('relatives').insert(payload).select('*').single();

    if (error) {
      handleSupabaseError(error, 'Failed to save relative.');
    }

    const [created] = await enrichRelativesWithLocalPhotos([mapRelativeRow(data)]);
    const relatives = await fetchAllRelatives(familyId);
    await applyLinkSync(created.id, null, linksFromInput(input), familyId, relatives);

    return (await fetchRelativeById(created.id, familyId)) ?? created;
  },

  async update(id: string, input: CreateRelativeInput, familyId: string): Promise<Relative> {
    const before = await fetchRelativeById(id, familyId);
    const supabase = getSupabaseClient();
    const payload = mapRelativeToUpdate(input, familyId);

    const { data, error } = await supabase
      .from('relatives')
      .update(payload)
      .eq('id', id)
      .eq('family_id', familyId)
      .select('*')
      .single();

    if (error) {
      handleSupabaseError(error, 'Failed to update relative.');
    }

    const [updated] = await enrichRelativesWithLocalPhotos([mapRelativeRow(data)]);
    const relatives = await fetchAllRelatives(familyId);
    await applyLinkSync(
      id,
      before ? linksFromRelative(before) : null,
      linksFromInput(input),
      familyId,
      relatives,
    );

    return (await fetchRelativeById(id, familyId)) ?? updated;
  },

  async updatePhotoUrl(
    id: string,
    photoUrl: string | null,
    familyId: string,
  ): Promise<Relative> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('relatives')
      .update({ photo_url: photoUrl })
      .eq('id', id)
      .eq('family_id', familyId)
      .select('*')
      .single();

    if (error) {
      handleSupabaseError(error, 'Failed to update photo.');
    }

    const [relative] = await enrichRelativesWithLocalPhotos([mapRelativeRow(data)]);
    return relative;
  },

  async delete(id: string, familyId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const relatives = await fetchAllRelatives(familyId);
    const assessment = assessSafeDelete(id, relatives);

    if (!assessment.canDelete) {
      throw new DeleteBlockedError(assessment);
    }

    const { error } = await supabase.from('relatives').delete().eq('id', id).eq('family_id', familyId);

    if (error) {
      handleSupabaseError(error, 'Failed to delete relative.');
    }
  },

  async clearRelativeReferences(relativeId: string, familyId: string): Promise<number> {
    const relatives = await fetchAllRelatives(familyId);
    const assessment = assessSafeDelete(relativeId, relatives);

    if (assessment.clearReferencePatches.length === 0) {
      return 0;
    }

    let applied = 0;

    for (const patch of assessment.clearReferencePatches) {
      await this.patchRelativeLinks(patch.personId, patch.patch, familyId);
      applied += 1;
    }

    return applied;
  },

  async applyShezhireRepairs(
    familyId: string,
    kinds: ShezhireRepairKind[],
  ): Promise<number> {
    const relatives = await fetchAllRelatives(familyId);
    const plan = buildShezhireRepairPlan(relatives);
    const patches = collectRepairPatches(plan, kinds);

    if (patches.length === 0) {
      return 0;
    }

    let applied = 0;

    for (const patch of patches) {
      await this.patchRelativeLinks(patch.personId, patch.patch, familyId);
      applied += 1;
    }

    return applied;
  },

  async syncParentChildLinks(
    parentId: string,
    selectedChildIds: string[],
    role: ParentLinkRole,
    familyId: string,
    relatives: Relative[],
  ): Promise<number> {
    const supabase = getSupabaseClient();
    const selectedSet = new Set(selectedChildIds);
    const currentlyLinked = getChildrenLinkedToParent(parentId, relatives, role);
    const updates: Array<{ childId: string; fatherId?: string | null; motherId?: string | null }> =
      [];

    for (const childId of selectedChildIds) {
      const child = relatives.find((relative) => relative.id === childId);
      if (!child) {
        continue;
      }

      const parent = relatives.find((relative) => relative.id === parentId);
      if (parent && areSharedParentSiblings(parent, child)) {
        continue;
      }

      if (role === 'father' && child.fatherId !== parentId) {
        updates.push({ childId, fatherId: parentId });
      }

      if (role === 'mother' && child.motherId !== parentId) {
        updates.push({ childId, motherId: parentId });
      }
    }

    for (const child of currentlyLinked) {
      if (selectedSet.has(child.id)) {
        continue;
      }

      if (role === 'father' && child.fatherId === parentId) {
        updates.push({ childId: child.id, fatherId: null });
      }

      if (role === 'mother' && child.motherId === parentId) {
        updates.push({ childId: child.id, motherId: null });
      }
    }

    for (const update of updates) {
      const row: { father_id?: string | null; mother_id?: string | null } = {};

      if (update.fatherId !== undefined) {
        row.father_id = update.fatherId;
      }

      if (update.motherId !== undefined) {
        row.mother_id = update.motherId;
      }

      const { error } = await supabase
        .from('relatives')
        .update(row)
        .eq('id', update.childId)
        .eq('family_id', familyId);

      if (error) {
        handleSupabaseError(error, 'Failed to sync child links.');
      }
    }

    if (updates.length === 0) {
      return 0;
    }

    let workingRelatives = await fetchAllRelatives(familyId);
    let syncCount = updates.length;

    for (const update of updates) {
      const before = relatives.find((relative) => relative.id === update.childId);
      const after: FamilyLinkSnapshot = {
        fatherId: update.fatherId !== undefined ? update.fatherId : (before?.fatherId ?? null),
        motherId: update.motherId !== undefined ? update.motherId : (before?.motherId ?? null),
        spouseId: before?.spouseId ?? null,
      };

      syncCount += await applyLinkSync(
        update.childId,
        before ? linksFromRelative(before) : null,
        after,
        familyId,
        workingRelatives,
      );
      workingRelatives = await fetchAllRelatives(familyId);
    }

    return syncCount;
  },

  async connectParents(
    id: string,
    input: ConnectParentsInput,
    familyId: string,
  ): Promise<Relative> {
    const before = await fetchRelativeById(id, familyId);
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('relatives')
      .update({
        father_id: input.fatherId ?? null,
        mother_id: input.motherId ?? null,
        spouse_id: input.spouseId ?? null,
      })
      .eq('id', id)
      .eq('family_id', familyId)
      .select('*')
      .single();

    if (error) {
      handleSupabaseError(error, 'Failed to connect relatives.');
    }

    const [updated] = await enrichRelativesWithLocalPhotos([mapRelativeRow(data)]);
    const relatives = await fetchAllRelatives(familyId);
    await applyLinkSync(
      id,
      before ? linksFromRelative(before) : null,
      linksFromInput(input),
      familyId,
      relatives,
    );

    return (await fetchRelativeById(id, familyId)) ?? updated;
  },

  async patchRelativeLinks(
    id: string,
    patch: Partial<ConnectParentsInput>,
    familyId: string,
    options?: PatchRelativeLinksOptions,
  ): Promise<Relative> {
    const before = await fetchRelativeById(id, familyId);
    const updated = await patchRelativeLinksRaw(id, patch, familyId);

    if (options?.skipSync) {
      return updated;
    }

    const relatives = await fetchAllRelatives(familyId);
    const after: FamilyLinkSnapshot = {
      fatherId: patch.fatherId !== undefined ? patch.fatherId : (before?.fatherId ?? null),
      motherId: patch.motherId !== undefined ? patch.motherId : (before?.motherId ?? null),
      spouseId: patch.spouseId !== undefined ? patch.spouseId : (before?.spouseId ?? null),
    };

    await applyLinkSync(
      id,
      before ? linksFromRelative(before) : null,
      after,
      familyId,
      relatives,
    );

    return (await fetchRelativeById(id, familyId)) ?? updated;
  },
};
