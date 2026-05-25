import { useMemo } from 'react';

import { useKinshipAnchor } from '@/hooks/useKinshipAnchor';
import { useRelatives } from '@/hooks/useRelatives';
import { Relative } from '@/types/relative';
import { ROOT_PERSON_LABEL } from '@/services/kinship/kinship-labels';
import { getKinshipCardLine } from '@/services/kinship.service';

export function useKinshipCardLine(
  rootPerson: Relative | null | undefined,
  targetPerson: Relative | null | undefined,
  relatives: Relative[],
): string | null {
  return useMemo(() => {
    if (!rootPerson || !targetPerson) {
      return null;
    }

    if (rootPerson.id === targetPerson.id) {
      return ROOT_PERSON_LABEL;
    }

    return getKinshipCardLine(rootPerson, targetPerson, relatives);
  }, [relatives, rootPerson, targetPerson]);
}

export function useMyKinshipCardLine(targetPerson: Relative | null | undefined): string | null {
  const { relatives } = useRelatives();
  const anchorPerson = useKinshipAnchor();

  return useKinshipCardLine(anchorPerson, targetPerson, relatives);
}

export function getStructuralRoleLabel(relative: Relative): string | undefined {
  const role = relative.relationship?.trim();
  return role || undefined;
}
