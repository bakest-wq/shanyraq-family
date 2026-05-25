import { useMemo } from 'react';

import { useRootPersonIdentity } from '@/hooks/useRootPersonIdentity';

import type { Relative } from '@/types/relative';

/**
 * Returns the person all kinship labels should be calculated from.
 * Defaults to «Мен»; updates instantly when the Shezhire focus root changes.
 */
export function useKinshipAnchor(): Relative | null {
  const { rootPerson } = useRootPersonIdentity();

  return useMemo(() => rootPerson, [rootPerson]);
}
