import { TEST_FAMILY_SEED_DRAFTS } from '@/constants/test-family-seed';
import { relativesService } from '@/services/relatives.service';
import { ConnectParentsInput } from '@/types/relative';
import {
  clearTestRelativeIds,
  getTestRelativeIds,
  saveTestRelativeIds,
} from '@/utils/test-family-seed-storage';

type SeedIdMap = Record<string, string>;

async function linkRelative(
  id: string,
  patch: Partial<ConnectParentsInput>,
  familyId: string,
): Promise<void> {
  await relativesService.patchRelativeLinks(id, patch, familyId);
}

async function unlinkSurvivorsFromTestIds(
  familyId: string,
  testIds: Set<string>,
): Promise<number> {
  const relatives = await relativesService.getAll(familyId);
  let cleaned = 0;

  for (const relative of relatives) {
    if (testIds.has(relative.id)) {
      continue;
    }

    const patch: Partial<ConnectParentsInput> = {};

    if (relative.fatherId && testIds.has(relative.fatherId)) {
      patch.fatherId = null;
    }

    if (relative.motherId && testIds.has(relative.motherId)) {
      patch.motherId = null;
    }

    if (relative.spouseId && testIds.has(relative.spouseId)) {
      patch.spouseId = null;
    }

    if (Object.keys(patch).length === 0) {
      continue;
    }

    await relativesService.patchRelativeLinks(relative.id, patch, familyId);
    cleaned += 1;
  }

  return cleaned;
}

async function applyFamilyLinks(ids: SeedIdMap, familyId: string): Promise<void> {
  const {
    ata,
    apa,
    ake,
    ana,
    bauyrzhan,
    zhubay,
    ul,
    kyzy,
    apke,
    zhien,
  } = ids;

  await linkRelative(ata, { spouseId: apa }, familyId);
  await linkRelative(apa, { spouseId: ata }, familyId);

  await linkRelative(ake, { fatherId: ata, motherId: apa, spouseId: ana }, familyId);
  await linkRelative(ana, { spouseId: ake }, familyId);

  await linkRelative(bauyrzhan, { fatherId: ake, motherId: ana, spouseId: zhubay }, familyId);
  await linkRelative(zhubay, { spouseId: bauyrzhan }, familyId);

  await linkRelative(ul, { fatherId: bauyrzhan, motherId: zhubay }, familyId);
  await linkRelative(kyzy, { fatherId: bauyrzhan, motherId: zhubay }, familyId);

  await linkRelative(apke, { fatherId: ake, motherId: ana }, familyId);
  await linkRelative(zhien, { motherId: apke }, familyId);
}

export const testFamilySeedService = {
  async hasSeed(familyId: string): Promise<boolean> {
    const ids = await getTestRelativeIds(familyId);
    return ids.length > 0;
  },

  async seed(familyId: string): Promise<{ created: number; replaced: number }> {
    const existingIds = await getTestRelativeIds(familyId);
    let replaced = 0;

    if (existingIds.length > 0) {
      const cleared = await this.clear(familyId);
      replaced = cleared.removed;
    }

    const idMap: SeedIdMap = {};

    for (const draft of TEST_FAMILY_SEED_DRAFTS) {
      const created = await relativesService.create(draft.input, familyId);
      idMap[draft.key] = created.id;
    }

    await applyFamilyLinks(idMap, familyId);

    await saveTestRelativeIds(familyId, Object.values(idMap));

    return {
      created: TEST_FAMILY_SEED_DRAFTS.length,
      replaced,
    };
  },

  async clear(familyId: string): Promise<{ removed: number; unlinked: number }> {
    const testIds = await getTestRelativeIds(familyId);

    if (testIds.length === 0) {
      return { removed: 0, unlinked: 0 };
    }

    const testIdSet = new Set(testIds);
    const unlinked = await unlinkSurvivorsFromTestIds(familyId, testIdSet);

    for (const id of testIds) {
      await relativesService.delete(id, familyId);
    }

    await clearTestRelativeIds(familyId);

    return {
      removed: testIds.length,
      unlinked,
    };
  },
};
