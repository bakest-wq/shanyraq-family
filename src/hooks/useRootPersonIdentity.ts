import { useCallback, useMemo } from 'react';

import { ROOT_IDENTITY_COPY } from '@/constants/root-identity-content';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { useShezhireRootContext } from '@/providers/ShezhireRootProvider';
import {
  isMeRootPerson,
  resolveRootPerson,
} from '@/services/root-person-identity.service';
import type { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';

export type RootPersonIdentity = {
  /** Linked «Мен» profile in the tree. */
  mePerson: Relative | null;
  meRelativeId: string | null;
  meLabel: string;
  /** Active kinship root — drives labels, jurt, explanations. */
  rootPerson: Relative | null;
  rootId: string | null;
  rootDisplayName: string;
  /** True when root is the linked user identity. */
  isMeRoot: boolean;
  isReady: boolean;
  defaultRootId: string | null;
  focusRootId: string | null;
  setRootPerson: (relativeId: string | null) => void;
  resetToMe: () => void;
};

/**
 * Single source of truth for «Мен» identity and the active kinship root.
 * Changing root recalculates all downstream kinship consumers on the next render.
 */
export function useRootPersonIdentity(): RootPersonIdentity {
  const {
    myRelative,
    myRelativeId,
    userName,
    isReady: identityReady,
  } = useUserIdentity();
  const {
    focusRootId,
    focusRootPerson,
    defaultRootId,
    isReady: rootReady,
    setFocusRootId,
    resetToDefaultRoot,
  } = useShezhireRootContext();

  const isReady = identityReady && rootReady;
  const meLabel = userName?.trim() || ROOT_IDENTITY_COPY.meLabel;

  const rootPerson = useMemo(
    () => resolveRootPerson(focusRootPerson, myRelative, isReady),
    [focusRootPerson, isReady, myRelative],
  );

  const rootId = rootPerson?.id ?? null;

  const isMeRoot = useMemo(
    () => isMeRootPerson(rootPerson, myRelative),
    [myRelative, rootPerson],
  );

  const rootDisplayName = useMemo(() => {
    if (!rootPerson) {
      return meLabel;
    }

    if (isMeRoot) {
      return meLabel;
    }

    return getRelativeDisplayName(rootPerson);
  }, [isMeRoot, meLabel, rootPerson]);

  const setRootPerson = useCallback(
    (relativeId: string | null) => {
      setFocusRootId(relativeId);
    },
    [setFocusRootId],
  );

  const resetToMe = useCallback(() => {
    resetToDefaultRoot();
  }, [resetToDefaultRoot]);

  return {
    mePerson: myRelative,
    meRelativeId: myRelativeId,
    meLabel,
    rootPerson,
    rootId,
    rootDisplayName,
    isMeRoot,
    isReady,
    defaultRootId,
    focusRootId,
    setRootPerson,
    resetToMe,
  };
}
