import { useMemo } from 'react';

import { useRootPersonIdentity } from '@/hooks/useRootPersonIdentity';
import { useRelatives } from '@/hooks/useRelatives';
import type { KinshipLabelMap } from '@/services/shezhire-view.types';
import {
  getPreparedKinshipLabel,
  prepareProfileFamilyView,
  prepareRelativesListView,
  prepareShezhireTreeView,
} from '@/services/shezhire-view.service';
import type { Relative } from '@/types/relative';

/** Prepared shezhire tree view from the active root. */
export function useShezhireTreePreparedView(
  rootPerson: Relative | null,
  excludeIds?: Set<string>,
) {
  const { relatives } = useRelatives();

  return useMemo(() => {
    if (!rootPerson) {
      return null;
    }

    return prepareShezhireTreeView(rootPerson, relatives, { excludeIds });
  }, [excludeIds, relatives, rootPerson]);
}

/** Prepared family ring + kinship labels for a profile. */
export function useProfileFamilyPreparedView(person: Relative | null) {
  const { rootPerson } = useRootPersonIdentity();
  const { relatives } = useRelatives();

  return useMemo(() => {
    if (!person) {
      return null;
    }

    return prepareProfileFamilyView(person, relatives, rootPerson);
  }, [person, relatives, rootPerson]);
}

/** Prepared kinship labels for the relatives list. */
export function useRelativesListPreparedView() {
  const { rootPerson } = useRootPersonIdentity();
  const { relatives } = useRelatives();

  return useMemo(
    () => prepareRelativesListView(rootPerson, relatives),
    [relatives, rootPerson],
  );
}

/** Lookup helper for prepared kinship label maps. */
export function usePreparedKinshipLabel(
  kinshipLabels: KinshipLabelMap,
  rootPerson: Relative | null,
  target: Relative | null,
): string | null {
  return useMemo(() => {
    if (!rootPerson || !target) {
      return null;
    }

    const label = getPreparedKinshipLabel(kinshipLabels, rootPerson, target);
    return label || null;
  }, [kinshipLabels, rootPerson, target]);
}
