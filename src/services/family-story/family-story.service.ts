import { analyzeKinship } from '@/services/kinship/kinship.service';
import type { KinshipConfidence } from '@/services/kinship/types';
import type { Relative } from '@/types/relative';
import { resolveFamilyRing } from '@/services/family-graph.service';

import {
  buildFamilyStoryLineForChildren,
  buildFamilyStoryLineFromRoot,
  resolveFamilyStoryContext,
} from '@/services/family-story/family-story-lines';
import type { FamilyStorySnapshot } from '@/services/family-story/family-story.types';

const SKIPPED_TYPES = new Set([
  'unknown',
  'self',
  'relative_neutral',
  'kuda_neutral',
  'tuas',
  'kayin_jurt',
]);

function normalizeLine(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function shouldSuppressDuplicate(fromRoot: string, explanationSummary: string): boolean {
  const normalizedStory = normalizeLine(fromRoot.replace(/^бұл кісі/i, 'бұл адам'));
  const normalizedExplanation = normalizeLine(explanationSummary);

  return (
    normalizedExplanation.includes(normalizedStory) ||
    normalizedStory === normalizedExplanation
  );
}

function resolveTone(targetDeceased: boolean): FamilyStorySnapshot['tone'] {
  return targetDeceased ? 'memorial' : 'warm';
}

/** Build optional family narrative lines from the active root perspective. */
export function buildFamilyStorySnapshot(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
): FamilyStorySnapshot | null {
  if (rootPerson.id === targetPerson.id) {
    return null;
  }

  const intel = analyzeKinship(rootPerson, targetPerson, relatives);
  const { label, confidence, explanation } = intel;

  if (confidence === 'low' || SKIPPED_TYPES.has(label.type) || !label.resolved) {
    return null;
  }

  const context = resolveFamilyStoryContext(label);
  let fromRoot = buildFamilyStoryLineFromRoot(label, context);

  if (fromRoot && shouldSuppressDuplicate(fromRoot, explanation.summary)) {
    fromRoot = null;
  }

  const hasChildren = resolveFamilyRing(rootPerson, relatives).children.length > 0;
  const forChildren = hasChildren ? buildFamilyStoryLineForChildren(label.type) : null;

  if (!fromRoot && !forChildren) {
    return null;
  }

  return {
    fromRoot,
    forChildren,
    tone: resolveTone(context.targetDeceased || Boolean(targetPerson.isDeceased)),
  };
}

export function isFamilyStoryEligible(confidence: KinshipConfidence, resolved: boolean): boolean {
  return resolved && confidence !== 'low';
}
