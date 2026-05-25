import type { FamilyMemory } from '@/types/archive';
import type { Family, FamilyMember } from '@/types/family';
import type { Relative } from '@/types/relative';
import type { TimelineEvent } from '@/types/timeline';

export const FAMILY_BACKUP_VERSION = 1;

export type FamilyBackupAssets = {
  relativePhotos?: Record<string, string>;
  memoryPhotos?: Record<string, string>;
};

export type FamilyBackupBundle = {
  version: typeof FAMILY_BACKUP_VERSION;
  exportedAt: string;
  familyId: string;
  familyName: string;
  family: Family | null;
  members: FamilyMember[];
  relatives: Relative[];
  memories: FamilyMemory[];
  timeline: TimelineEvent[];
  assets?: FamilyBackupAssets;
};

export type LocalBackupMeta = {
  exportedAt: string;
  fileName: string;
  relativeCount: number;
  memoryCount: number;
};

export type FamilyBackupSummary = {
  relativeCount: number;
  memoryCount: number;
  timelineCount: number;
  exportedAt: string;
};

export type RestoreBackupResult = {
  relativesRestored: number;
  memoriesRestored: number;
  photosRestored: number;
};

export type BackupValidationResult =
  | { ok: true; bundle: FamilyBackupBundle }
  | { ok: false; error: string };
