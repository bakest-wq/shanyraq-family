import type { Relative } from '@/types/relative';
import {
  buildMissingLinkNavigateParams,
  type MissingLinkKind,
  type MissingLinkNavigateParams,
} from '@/utils/missing-link-actions';

export function buildProfileMissingLinkParams(
  kind: MissingLinkKind,
  targetPerson: Relative,
  spouse: Relative | null = null,
): MissingLinkNavigateParams {
  return {
    ...buildMissingLinkNavigateParams(kind, targetPerson, {
      shezhireRootId: targetPerson.id,
      spouse,
    }),
    returnTo: 'details',
  };
}
