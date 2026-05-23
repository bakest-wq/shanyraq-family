import { useMemo } from 'react';

import { useRelatives } from '@/hooks/useRelatives';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { Relative } from '@/types/relative';
import { getKinshipCardLine } from '@/utils/kinship/getKinshipLabel';

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
      return 'Орталық тұлға';
    }

    return getKinshipCardLine(rootPerson, targetPerson, relatives);
  }, [relatives, rootPerson, targetPerson]);
}

export function useMyKinshipCardLine(targetPerson: Relative | null | undefined): string | null {
  const { relatives } = useRelatives();
  const { myRelative } = useUserIdentity();

  return useKinshipCardLine(myRelative, targetPerson, relatives);
}

export function getStructuralRoleLabel(relative: Relative): string | undefined {
  const role = relative.relationship?.trim();
  return role || undefined;
}
