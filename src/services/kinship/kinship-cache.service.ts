import type { Relative } from '@/types/relative';
import type { JurtGroupsTree } from '@/services/family-graph.types';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { GENDER_HINT_KZ } from '@/utils/kinship/labels.kz';

import {
  buildJurtGraphFingerprint,
  buildKinshipStructuralFingerprint,
  hashExcludeIds,
} from '@/services/kinship/family-structural-fingerprint';
import { computeKinshipRelationshipSnapshot } from '@/services/kinship/kinship-analysis';
import type {
  KinshipCacheStats,
  KinshipRelationshipSnapshot,
} from '@/services/kinship/kinship-cache.types';
import {
  resolveConfidenceSafeExplanation,
  resolveConfidenceSafeLabel,
} from '@/services/kinship/kinship-confidence';
import { buildHumanKinshipExplanation } from '@/services/kinship/kinship-human-explanation';
import type { KinshipExplanation } from '@/services/kinship/types';

const MAX_PAIR_ENTRIES = 2000;
const MAX_JURT_ENTRIES = 32;

type PairCacheEntry = {
  fingerprint: string;
  snapshot: KinshipRelationshipSnapshot;
};

type JurtCacheEntry = {
  fingerprint: string;
  tree: JurtGroupsTree;
};

function pairCacheKey(rootId: string, targetId: string): string {
  return `${rootId}:${targetId}`;
}

function jurtCacheKey(rootId: string, excludeKey: string): string {
  return `${rootId}:${excludeKey}`;
}

class KinshipCacheService {
  private pairCache = new Map<string, PairCacheEntry>();
  private jurtCache = new Map<string, JurtCacheEntry>();
  private structuralFingerprint: string | null = null;
  private jurtFingerprint: string | null = null;
  private familyId: string | null = null;

  /** Sync graph state — clears caches only when structural links change. */
  syncStructuralState(relatives: Relative[], familyId?: string | null): void {
    if (familyId !== undefined && familyId !== this.familyId) {
      this.clearAll();
      this.familyId = familyId ?? null;
    }

    const nextStructural = buildKinshipStructuralFingerprint(relatives);
    const nextJurt = buildJurtGraphFingerprint(relatives);

    if (this.structuralFingerprint !== null && this.structuralFingerprint !== nextStructural) {
      this.pairCache.clear();
    }

    if (this.jurtFingerprint !== null && this.jurtFingerprint !== nextJurt) {
      this.jurtCache.clear();
    }

    this.structuralFingerprint = nextStructural;
    this.jurtFingerprint = nextJurt;
  }

  getRelationshipSnapshot(
    rootPerson: Relative,
    targetPerson: Relative,
    relatives: Relative[],
  ): KinshipRelationshipSnapshot {
    const fingerprint = buildKinshipStructuralFingerprint(relatives);
    const key = pairCacheKey(rootPerson.id, targetPerson.id);
    const cached = this.pairCache.get(key);

    if (cached?.fingerprint === fingerprint) {
      return cached.snapshot;
    }

    const snapshot = computeKinshipRelationshipSnapshot(rootPerson, targetPerson, relatives);
    this.pairCache.set(key, { fingerprint, snapshot });
    this.trimPairCache();
    this.structuralFingerprint = fingerprint;

    return snapshot;
  }

  getExplanation(
    rootPerson: Relative,
    targetPerson: Relative,
    relatives: Relative[],
    toMe: boolean,
  ): KinshipExplanation {
    const snapshot = this.getRelationshipSnapshot(rootPerson, targetPerson, relatives);
    const rootName = getRelativeDisplayName(rootPerson);
    const summary = buildHumanKinshipExplanation(snapshot.label, toMe, rootName);

    return {
      title: resolveConfidenceSafeLabel(snapshot.label, snapshot.confidence),
      summary: resolveConfidenceSafeExplanation(summary, snapshot.label, snapshot.confidence),
      pathText: '',
      hint: snapshot.label.missingGenderHint ? GENDER_HINT_KZ : undefined,
      result: snapshot.label,
    };
  }

  getJurtGroups(
    rootPerson: Relative,
    relatives: Relative[],
    excludeIds: Set<string>,
    compute: () => JurtGroupsTree,
  ): JurtGroupsTree {
    const fingerprint = buildJurtGraphFingerprint(relatives);
    const key = jurtCacheKey(rootPerson.id, hashExcludeIds(excludeIds));
    const cached = this.jurtCache.get(key);

    if (cached?.fingerprint === fingerprint) {
      return cached.tree;
    }

    const tree = compute();
    this.jurtCache.set(key, { fingerprint, tree });
    this.trimJurtCache();
    this.jurtFingerprint = fingerprint;

    return tree;
  }

  invalidateAll(): void {
    this.clearAll();
  }

  /** Drop cached pairs for one root — e.g. when focus root changes. */
  pruneRoot(rootId: string): void {
    for (const key of this.pairCache.keys()) {
      if (key.startsWith(`${rootId}:`)) {
        this.pairCache.delete(key);
      }
    }

    for (const key of this.jurtCache.keys()) {
      if (key.startsWith(`${rootId}:`)) {
        this.jurtCache.delete(key);
      }
    }
  }

  getStats(): KinshipCacheStats {
    return {
      pairEntries: this.pairCache.size,
      jurtEntries: this.jurtCache.size,
      structuralFingerprint: this.structuralFingerprint,
      jurtFingerprint: this.jurtFingerprint,
      familyId: this.familyId,
    };
  }

  private clearAll(): void {
    this.pairCache.clear();
    this.jurtCache.clear();
    this.structuralFingerprint = null;
    this.jurtFingerprint = null;
  }

  private trimPairCache(): void {
    while (this.pairCache.size > MAX_PAIR_ENTRIES) {
      const oldest = this.pairCache.keys().next().value;
      if (!oldest) {
        break;
      }
      this.pairCache.delete(oldest);
    }
  }

  private trimJurtCache(): void {
    while (this.jurtCache.size > MAX_JURT_ENTRIES) {
      const oldest = this.jurtCache.keys().next().value;
      if (!oldest) {
        break;
      }
      this.jurtCache.delete(oldest);
    }
  }
}

export const kinshipCacheService = new KinshipCacheService();

export function invalidateKinshipCache(): void {
  kinshipCacheService.invalidateAll();
}
