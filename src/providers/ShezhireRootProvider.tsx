import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useFamilyContext } from '@/providers/FamilyProvider';
import { useRelativesContext } from '@/providers/RelativesProvider';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import type { Relative } from '@/types/relative';
import { pickDefaultRootId } from '@/utils/focused-family-tree';
import { findRelativeByLinkId, relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { shezhireRootService } from '@/services/shezhire-root.service';
import { kinshipCacheService } from '@/services/kinship/kinship-cache.service';
import { shouldResetFocusOnIdentityChange } from '@/services/root-person-identity.service';

type ShezhireRootContextValue = {
  focusRootId: string | null;
  focusRootPerson: Relative | null;
  defaultRootId: string | null;
  isReady: boolean;
  setFocusRootId: (relativeId: string | null) => void;
  resetToDefaultRoot: () => void;
};

const ShezhireRootContext = createContext<ShezhireRootContextValue | null>(null);

export function ShezhireRootProvider({ children }: PropsWithChildren) {
  const { familyId } = useFamilyContext();
  const { relatives } = useRelativesContext();
  const { myRelativeId } = useUserIdentity();
  const [focusRootId, setFocusRootIdState] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const previousMyRelativeIdRef = useRef<string | null>(null);

  const defaultRootId = useMemo(
    () => pickDefaultRootId(relatives, myRelativeId),
    [myRelativeId, relatives],
  );

  const resolveValidRootId = useCallback(
    (candidateId: string | null | undefined): string | null => {
      if (!candidateId) {
        return defaultRootId;
      }

      return relatives.some((relative) => relativeLinkIdsMatch(relative.id, candidateId))
        ? candidateId
        : defaultRootId;
    },
    [defaultRootId, relatives],
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!familyId) {
        if (!cancelled) {
          setFocusRootIdState(null);
          setIsReady(true);
        }
        return;
      }

      const stored = await shezhireRootService.getFocusRootId(familyId);
      if (cancelled) {
        return;
      }

      setFocusRootIdState(resolveValidRootId(stored));
      setIsReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [familyId, resolveValidRootId]);

  useEffect(() => {
    setFocusRootIdState((current) => resolveValidRootId(current));
  }, [resolveValidRootId]);

  const setFocusRootId = useCallback(
    (relativeId: string | null) => {
      const nextId = resolveValidRootId(relativeId);

      setFocusRootIdState((current) => {
        if (current && nextId && current !== nextId) {
          kinshipCacheService.pruneRoot(current);
        }
        return nextId;
      });

      if (familyId) {
        void shezhireRootService.setFocusRootId(familyId, nextId);
      }
    },
    [familyId, resolveValidRootId],
  );

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const previousId = previousMyRelativeIdRef.current;
    if (shouldResetFocusOnIdentityChange(previousId, myRelativeId)) {
      setFocusRootId(defaultRootId);
    }

    previousMyRelativeIdRef.current = myRelativeId;
  }, [defaultRootId, isReady, myRelativeId, setFocusRootId]);

  const resetToDefaultRoot = useCallback(() => {
    setFocusRootId(defaultRootId);
  }, [defaultRootId, setFocusRootId]);

  const focusRootPerson = useMemo(() => {
    if (!focusRootId) {
      return null;
    }

    return findRelativeByLinkId(relatives, focusRootId);
  }, [focusRootId, relatives]);

  const value = useMemo(
    () => ({
      focusRootId,
      focusRootPerson,
      defaultRootId,
      isReady,
      setFocusRootId,
      resetToDefaultRoot,
    }),
    [defaultRootId, focusRootId, focusRootPerson, isReady, resetToDefaultRoot, setFocusRootId],
  );

  return <ShezhireRootContext.Provider value={value}>{children}</ShezhireRootContext.Provider>;
}

export function useShezhireRootContext(): ShezhireRootContextValue {
  const context = useContext(ShezhireRootContext);

  if (!context) {
    throw new Error('useShezhireRootContext must be used within ShezhireRootProvider.');
  }

  return context;
}
