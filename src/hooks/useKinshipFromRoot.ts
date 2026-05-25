import { useMemo } from 'react';

import { useRootPersonIdentity } from '@/hooks/useRootPersonIdentity';
import { useRelatives } from '@/hooks/useRelatives';
import {
  analyzeKinship,
  getKinshipCardLine,
  getThreeJurtGroup,
  mapThreeJurtGroupToJurtKind,
  ROOT_PERSON_LABEL,
} from '@/services/kinship.service';
import type { KinshipMemoryContext } from '@/services/kinship/kinship-memory.types';
import { buildKinshipMemorySnapshot } from '@/services/kinship/kinship-memory';
import type { KinshipExplanation, ThreeJurtGroup } from '@/services/kinship/types';
import type { KinshipMemorySnapshot } from '@/services/kinship/kinship-memory.types';
import type { Relative } from '@/types/relative';
import { buildThreeJurtGroups } from '@/services/family-graph.service';
import type { JurtGroupsTree } from '@/services/family-graph.types';

export type KinshipFromRootSnapshot = {
  cardLine: string;
  explanation: KinshipExplanation;
  jurtGroup: ThreeJurtGroup;
  jurtKind: ReturnType<typeof mapThreeJurtGroupToJurtKind>;
  memory: KinshipMemorySnapshot | null;
};

/** Full kinship snapshot for one target relative from the active root. */
export function useKinshipFromRoot(
  targetPerson: Relative | null | undefined,
  memoryContext?: KinshipMemoryContext,
): KinshipFromRootSnapshot | null {
  const { rootPerson, isReady } = useRootPersonIdentity();
  const { relatives } = useRelatives();

  return useMemo(() => {
    if (!isReady || !rootPerson || !targetPerson) {
      return null;
    }

    if (rootPerson.id === targetPerson.id) {
      const intel = analyzeKinship(rootPerson, targetPerson, relatives);

      return {
        cardLine: ROOT_PERSON_LABEL,
        explanation: intel.explanation,
        jurtGroup: 'direct_family',
        jurtKind: 'oz',
        memory: null,
      };
    }

    const intel = analyzeKinship(rootPerson, targetPerson, relatives);
    const memory = buildKinshipMemorySnapshot(
      rootPerson,
      targetPerson,
      relatives,
      memoryContext,
    );

    return {
      cardLine: intel.cardLine,
      explanation: intel.explanation,
      jurtGroup: intel.jurtGroup,
      jurtKind: mapThreeJurtGroupToJurtKind(intel.jurtGroup),
      memory,
    };
  }, [isReady, memoryContext, relatives, rootPerson, targetPerson]);
}

/** Card line only — lighter than full snapshot. */
export function useKinshipCardLineFromRoot(
  targetPerson: Relative | null | undefined,
): string | null {
  const { rootPerson, isReady } = useRootPersonIdentity();
  const { relatives } = useRelatives();

  return useMemo(() => {
    if (!isReady || !rootPerson || !targetPerson) {
      return null;
    }

    if (rootPerson.id === targetPerson.id) {
      return ROOT_PERSON_LABEL;
    }

    return getKinshipCardLine(rootPerson, targetPerson, relatives);
  }, [isReady, relatives, rootPerson, targetPerson]);
}

/** Build үш жұрт groups from the active root. */
export function useJurtGroupsFromRoot(excludeIds: Set<string> = new Set()): JurtGroupsTree | null {
  const { rootPerson, isReady } = useRootPersonIdentity();
  const { relatives } = useRelatives();

  return useMemo(() => {
    if (!isReady || !rootPerson) {
      return null;
    }

    return buildThreeJurtGroups(rootPerson, relatives, excludeIds);
  }, [excludeIds, isReady, relatives, rootPerson]);
}

/** Jurt group string for a target from active root. */
export function useJurtGroupFromRoot(
  targetPerson: Relative | null | undefined,
): ThreeJurtGroup | null {
  const { rootPerson, isReady } = useRootPersonIdentity();
  const { relatives } = useRelatives();

  return useMemo(() => {
    if (!isReady || !rootPerson || !targetPerson) {
      return null;
    }

    return getThreeJurtGroup(rootPerson, targetPerson, relatives);
  }, [isReady, relatives, rootPerson, targetPerson]);
}
