/**
 * @deprecated Import from `@/utils/shezhire/connectedGraph` instead.
 */
export {
  getConnectedRelativeIds as getRootGraphConnectedIds,
  getNeighbors,
  getUnplacedRelatives as filterUnplacedRelatives,
  isPersonConnected,
  type ConnectedGraphOptions as RootGraphConnectivityOptions,
} from '@/utils/shezhire/connectedGraph';

import {
  getConnectedRelativeIds,
  isPersonConnected,
  type ConnectedGraphOptions,
} from '@/utils/shezhire/connectedGraph';
import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';

export type ConnectedGraphTraversalResult = {
  connectedIds: Set<string>;
  visited: Set<string>;
};

export function traverseConnectedGraph(
  rootPerson: Relative,
  allRelatives: Relative[],
  options: ConnectedGraphOptions = {},
): ConnectedGraphTraversalResult {
  const connectedIds = getConnectedRelativeIds(rootPerson, allRelatives, options);

  return {
    connectedIds,
    visited: new Set(connectedIds),
  };
}

export function isConnectedToRootGraph(
  relative: Relative,
  rootPerson: Relative,
  allRelatives: Relative[],
  options: ConnectedGraphOptions = {},
): boolean {
  if (relativeLinkIdsMatch(relative.id, rootPerson.id)) {
    return true;
  }

  const connectedIds = getConnectedRelativeIds(rootPerson, allRelatives, options);
  return isPersonConnected(relative, connectedIds);
}
