export type FamilyStoryTone = 'warm' | 'memorial';

/** Optional narrative lines — short, warm, never shown on lists or tree. */
export type FamilyStorySnapshot = {
  fromRoot: string | null;
  forChildren: string | null;
  tone: FamilyStoryTone;
};

export type FamilyStoryContext = {
  viaGrandparent: boolean;
  targetDeceased: boolean;
};
