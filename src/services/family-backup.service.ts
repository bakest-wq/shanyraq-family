import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { archiveService } from '@/services/archive.service';
import { familiesService } from '@/services/families.service';
import { relativesService } from '@/services/relatives.service';
import type {
  FamilyBackupBundle,
  LocalBackupMeta,
  RestoreBackupResult,
} from '@/types/family-backup';
import { FAMILY_BACKUP_VERSION } from '@/types/family-backup';
import type { Relative } from '@/types/relative';
import {
  collectBackupAssets,
  getBackupCacheFileName,
  getBackupPdfFileName,
  readTextFile,
  restoreMemoryPhotosFromAssets,
  restoreRelativePhotosFromAssets,
  writeBackupJsonFile,
  writeLocalLatestBackup,
} from '@/utils/family-backup-assets';
import {
  buildBackupFileName,
  buildFamilyBackupPdfHtml,
  validateFamilyBackup,
} from '@/utils/family-backup-format';
import { applyGraphSnapshot } from '@/utils/graph-restore';
import { mergeTimelineEvents } from '@/utils/timeline-events';

const LAST_BACKUP_META_KEY = '@shanyraq/last-backup-meta';

function metaStorageKey(familyId: string): string {
  return `${LAST_BACKUP_META_KEY}:${familyId}`;
}

async function buildBackupBundle(familyId: string, familyName: string): Promise<FamilyBackupBundle> {
  const [family, members, relatives, memories] = await Promise.all([
    familiesService.getById(familyId),
    familiesService.getMembers(familyId),
    relativesService.getAll(familyId),
    archiveService.getAll(familyId),
  ]);

  const assets = await collectBackupAssets(relatives, memories);
  const exportedAt = new Date().toISOString();

  return {
    version: FAMILY_BACKUP_VERSION,
    exportedAt,
    familyId,
    familyName,
    family,
    members,
    relatives,
    memories,
    timeline: mergeTimelineEvents(relatives),
    assets,
  };
}

function serializeBundle(bundle: FamilyBackupBundle): string {
  return JSON.stringify(bundle, null, 2);
}

async function shareFile(uri: string, mimeType: string): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Бұл құрылғыда файлмен бөлісу қолжетімсіз');
  }

  await Sharing.shareAsync(uri, {
    mimeType,
    dialogTitle: 'Shanyraq Family сақтық көшірмесі',
  });
}

async function upsertRelativeRows(familyId: string, relatives: Relative[]): Promise<number> {
  return applyGraphSnapshot(familyId, relatives);
}

export const familyBackupService = {
  async getLastBackupMeta(familyId: string): Promise<LocalBackupMeta | null> {
    try {
      const raw = await AsyncStorage.getItem(metaStorageKey(familyId));
      if (!raw) {
        return null;
      }

      return JSON.parse(raw) as LocalBackupMeta;
    } catch {
      return null;
    }
  },

  async createBundle(familyId: string, familyName: string): Promise<FamilyBackupBundle> {
    return buildBackupBundle(familyId, familyName);
  },

  async exportJson(familyId: string, familyName: string): Promise<{ fileName: string; summary: LocalBackupMeta }> {
    const bundle = await buildBackupBundle(familyId, familyName);
    const json = serializeBundle(bundle);
    const fileName = buildBackupFileName(familyName, bundle.exportedAt);
    const uri = await writeBackupJsonFile(getBackupCacheFileName(familyId), json);
    await shareFile(uri, 'application/json');

    const summary: LocalBackupMeta = {
      exportedAt: bundle.exportedAt,
      fileName,
      relativeCount: bundle.relatives.length,
      memoryCount: bundle.memories.length,
    };

    return { fileName, summary };
  },

  async exportPdf(familyId: string, familyName: string): Promise<string> {
    const bundle = await buildBackupBundle(familyId, familyName);
    const html = buildFamilyBackupPdfHtml(bundle);
    const { uri } = await Print.printToFileAsync({ html });
    await shareFile(uri, 'application/pdf');
    return getBackupPdfFileName(familyId);
  },

  async saveManualBackup(
    familyId: string,
    familyName: string,
  ): Promise<LocalBackupMeta> {
    const bundle = await buildBackupBundle(familyId, familyName);
    const json = serializeBundle(bundle);
    const fileName = buildBackupFileName(familyName, bundle.exportedAt);

    await writeLocalLatestBackup(familyId, fileName, json);

    const meta: LocalBackupMeta = {
      exportedAt: bundle.exportedAt,
      fileName,
      relativeCount: bundle.relatives.length,
      memoryCount: bundle.memories.length,
    };

    await AsyncStorage.setItem(metaStorageKey(familyId), JSON.stringify(meta));
    return meta;
  },

  async pickBackupFile(): Promise<FamilyBackupBundle | null> {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return null;
    }

    const rawText = await readTextFile(result.assets[0].uri);
    const parsed = JSON.parse(rawText) as unknown;
    const validation = validateFamilyBackup(parsed);

    if (!validation.ok) {
      throw new Error(validation.error);
    }

    return validation.bundle;
  },

  async restoreBackup(
    familyId: string,
    bundle: FamilyBackupBundle,
  ): Promise<RestoreBackupResult> {
    if (bundle.familyId !== familyId) {
      throw new Error('Бұл сақтық көшірме басқа отбасыға тиесілі');
    }

    const relativesRestored = await upsertRelativeRows(familyId, bundle.relatives);
    const memoriesWithPhotos = await restoreMemoryPhotosFromAssets(bundle.memories, bundle.assets);
    await archiveService.replaceAll(familyId, memoriesWithPhotos);
    const photosRestored = await restoreRelativePhotosFromAssets(bundle.assets);

    const meta: LocalBackupMeta = {
      exportedAt: bundle.exportedAt,
      fileName: buildBackupFileName(bundle.familyName, bundle.exportedAt),
      relativeCount: bundle.relatives.length,
      memoryCount: bundle.memories.length,
    };
    await AsyncStorage.setItem(metaStorageKey(familyId), JSON.stringify(meta));

    return {
      relativesRestored,
      memoriesRestored: bundle.memories.length,
      photosRestored,
    };
  },
};
