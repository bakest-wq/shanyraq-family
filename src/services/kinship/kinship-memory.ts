import type { Relative } from '@/types/relative';
import type { KinshipType } from '@/utils/kinship/types';

import { analyzeKinship } from '@/services/kinship/shared/kinship-analyze';
import {
  CHILDHOOD_NOTE_PATTERN,
  DIRECT_PARENT_KINSHIP_TYPES,
  GRANDPARENT_KINSHIP_TYPES,
  SPOUSE_KINSHIP_TYPES,
} from '@/services/kinship/shared/kinship-constants';
import {
  kinshipAgeGapYears,
  kinshipRolePhrase,
  normalizeKinshipText,
} from '@/services/kinship/shared/kinship-utils';
import type { KinshipConfidence } from '@/services/kinship/types';

import type {
  KinshipMemoryContext,
  KinshipMemorySignal,
  KinshipMemorySnapshot,
  KinshipMemorySource,
  KinshipMemoryTone,
} from '@/services/kinship/kinship-memory.types';

type MemoryBuildContext = {
  rootPerson: Relative;
  targetPerson: Relative;
  relatives: Relative[];
  kinshipType: KinshipType;
  cardLine: string;
  confidence: KinshipConfidence;
  context: KinshipMemoryContext;
  signals: KinshipMemorySignal[];
  memoryIds: string[];
  voiceStoryIds: string[];
  momentIds: string[];
};

function emptySnapshot(confidence: KinshipConfidence = 'low'): KinshipMemorySnapshot {
  return {
    line: null,
    tone: 'neutral',
    confidence,
    source: 'none',
    signals: [],
    memoryIds: [],
    voiceStoryIds: [],
    momentIds: [],
  };
}

function detectSignals(
  rootPerson: Relative,
  targetPerson: Relative,
  kinshipType: KinshipType,
  context: KinshipMemoryContext,
): KinshipMemorySignal[] {
  const signals: KinshipMemorySignal[] = [];
  const linkedMemories = (context.memories ?? []).filter(
    (memory) => memory.relativeId === targetPerson.id,
  );
  const notes = targetPerson.notes?.trim() ?? '';

  if (targetPerson.isDeceased) {
    signals.push('deceased');
  }

  const gap = kinshipAgeGapYears(rootPerson, targetPerson);
  if (gap !== null && gap >= 18) {
    signals.push('elder_to_root');
  }

  if (linkedMemories.some((memory) => memory.story.trim().length > 0)) {
    signals.push('has_archive_stories');
  }

  if (notes.length > 0) {
    signals.push('has_notes');
  }

  const childhoodFromNotes = CHILDHOOD_NOTE_PATTERN.test(notes);
  const childhoodFromAge =
    GRANDPARENT_KINSHIP_TYPES.has(kinshipType) && gap !== null && gap >= 25;

  if (childhoodFromNotes || childhoodFromAge) {
    signals.push('childhood_together');
  }

  return signals;
}

function composeLine(
  ctx: MemoryBuildContext,
): { line: string; tone: KinshipMemoryTone; source: KinshipMemorySource } | null {
  const role = kinshipRolePhrase(ctx.kinshipType, ctx.cardLine);

  if (ctx.signals.includes('has_archive_stories') && ctx.memoryIds.length > 0) {
    return {
      line: `Отбасы естеліктеріндегі ${role}`,
      tone: 'story',
      source: 'linked_memory',
    };
  }

  if (ctx.signals.includes('has_notes') && CHILDHOOD_NOTE_PATTERN.test(ctx.targetPerson.notes ?? '')) {
    return {
      line: `Балалық шағыңызда бірге тұрған ${role}`,
      tone: 'warm',
      source: 'notes',
    };
  }

  if (ctx.signals.includes('deceased')) {
    return {
      line: `Есте қалар ${role}`,
      tone: 'memorial',
      source: 'life_signals',
    };
  }

  if (ctx.signals.includes('childhood_together')) {
    return {
      line: `Балалық шағыңызда бірге тұрған ${role}`,
      tone: 'warm',
      source: 'life_signals',
    };
  }

  if (DIRECT_PARENT_KINSHIP_TYPES.has(ctx.kinshipType)) {
    return {
      line: `Отбасыңыздың іргелі тірегі — ${role}`,
      tone: 'warm',
      source: 'kinship_template',
    };
  }

  if (SPOUSE_KINSHIP_TYPES.has(ctx.kinshipType)) {
    return {
      line: 'Жастық пен өміріңіздің серігі',
      tone: 'warm',
      source: 'kinship_template',
    };
  }

  if (ctx.kinshipType.startsWith('nagashy_') && ctx.signals.includes('elder_to_root')) {
    return {
      line: `Жақын нағашы жағыңыздағы ${role}`,
      tone: 'warm',
      source: 'kinship_template',
    };
  }

  if (ctx.kinshipType.startsWith('kayin_') && ctx.signals.includes('elder_to_root')) {
    return {
      line: `Жаңа отбасыңыздың қарубелі — ${role}`,
      tone: 'warm',
      source: 'kinship_template',
    };
  }

  return null;
}

function shouldSuppressLine(line: string, cardLine: string): boolean {
  const normalizedLine = normalizeKinshipText(line);
  const normalizedCard = normalizeKinshipText(cardLine);

  return normalizedLine === normalizedCard;
}

/** Build a warm memory snapshot for profile — keeps lists and trees on short labels. */
export function buildKinshipMemorySnapshot(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
  context: KinshipMemoryContext = {},
): KinshipMemorySnapshot {
  if (rootPerson.id === targetPerson.id) {
    return emptySnapshot('high');
  }

  const intel = analyzeKinship(rootPerson, targetPerson, relatives);
  const { confidence, cardLine, label } = intel;

  if (confidence === 'low' || label.type === 'unknown') {
    return emptySnapshot(confidence);
  }

  const linkedMemories = (context.memories ?? []).filter(
    (memory) => memory.relativeId === targetPerson.id,
  );
  const memoryIds = linkedMemories.map((memory) => memory.id);
  const voiceStoryIds = (context.voiceStories ?? [])
    .filter((story) => story.relativeId === targetPerson.id)
    .map((story) => story.id);
  const momentIds = [...(context.momentIds ?? [])];

  const signals = detectSignals(rootPerson, targetPerson, label.type, context);

  const buildContext: MemoryBuildContext = {
    rootPerson,
    targetPerson,
    relatives,
    kinshipType: label.type,
    cardLine,
    confidence,
    context,
    signals,
    memoryIds,
    voiceStoryIds,
    momentIds,
  };

  const composed =
    confidence === 'high'
      ? composeLine(buildContext)
      : composedMediumConfidence(buildContext);

  if (!composed || shouldSuppressLine(composed.line, cardLine)) {
    return {
      ...emptySnapshot(confidence),
      confidence,
      signals,
      memoryIds,
      voiceStoryIds,
      momentIds,
    };
  }

  return {
    line: composed.line,
    tone: composed.tone,
    confidence,
    source: composed.source,
    signals,
    memoryIds,
    voiceStoryIds,
    momentIds,
  };
}

function composedMediumConfidence(
  ctx: MemoryBuildContext,
): { line: string; tone: KinshipMemoryTone; source: KinshipMemorySource } | null {
  const role = kinshipRolePhrase(ctx.kinshipType, ctx.cardLine);

  if (ctx.signals.includes('has_archive_stories') && ctx.memoryIds.length > 0) {
    return {
      line: `Отбасы естеліктеріндегі ${role}`,
      tone: 'story',
      source: 'linked_memory',
    };
  }

  if (ctx.signals.includes('deceased')) {
    return {
      line: `Есте қалар ${role}`,
      tone: 'memorial',
      source: 'life_signals',
    };
  }

  return null;
}

/** Convenience accessor for profile UI. */
export function buildKinshipMemoryLine(
  rootPerson: Relative,
  targetPerson: Relative,
  relatives: Relative[],
  context?: KinshipMemoryContext,
): string | null {
  return buildKinshipMemorySnapshot(rootPerson, targetPerson, relatives, context).line;
}
