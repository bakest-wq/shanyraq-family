import type { FamilyMemory } from '@/types/archive';

import type { KinshipConfidence } from '@/services/kinship/types';

/** Emotional tone for profile memory lines — drives future UI theming. */
export type KinshipMemoryTone = 'warm' | 'memorial' | 'story' | 'neutral';

/** Which signal composed the memory line. */
export type KinshipMemorySource =
  | 'linked_memory'
  | 'notes'
  | 'life_signals'
  | 'kinship_template'
  | 'none';

export type KinshipMemorySignal =
  | 'deceased'
  | 'elder_to_root'
  | 'childhood_together'
  | 'has_archive_stories'
  | 'has_notes';

/** Optional context — grows with voice stories and family moments. */
export type KinshipMemoryContext = {
  memories?: FamilyMemory[];
  /** Reserved for voice narration assets. */
  voiceStories?: readonly { id: string; relativeId?: string | null }[];
  /** Reserved for curated timeline moment ids. */
  momentIds?: readonly string[];
};

export type KinshipMemorySnapshot = {
  /** Warm contextual line for profile — null when suppressed or unavailable. */
  line: string | null;
  tone: KinshipMemoryTone;
  confidence: KinshipConfidence;
  source: KinshipMemorySource;
  signals: KinshipMemorySignal[];
  /** Linked archive rows used to compose the line. */
  memoryIds: string[];
  /** Future: voice narration asset ids. */
  voiceStoryIds: string[];
  /** Future: curated family moment ids. */
  momentIds: string[];
};
