import { Platform } from 'react-native';
import {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  readAsStringAsync,
  writeAsStringAsync,
} from 'expo-file-system/legacy';

import type { FamilyBackupAssets } from '@/types/family-backup';
import type { FamilyMemory } from '@/types/archive';
import type { Relative } from '@/types/relative';
import { getLocalRelativePhotoUri, registerLocalRelativePhotoUri } from '@/utils/relative-photo-local';
import { registerLocalMemoryPhotoUri } from '@/utils/memory-photo-local';

const BACKUP_DIR = `${documentDirectory ?? ''}family-backups/`;

async function ensureBackupDir(): Promise<void> {
  if (!documentDirectory) {
    return;
  }

  const info = await getInfoAsync(BACKUP_DIR);
  if (!info.exists) {
    await makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
  }
}

async function readFileAsBase64(uri: string): Promise<string | null> {
  if (uri.startsWith('data:')) {
    const comma = uri.indexOf(',');
    return comma >= 0 ? uri.slice(comma + 1) : null;
  }

  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const info = await getInfoAsync(uri);
    if (!info.exists) {
      return null;
    }

    return readAsStringAsync(uri, { encoding: 'base64' });
  } catch {
    return null;
  }
}

async function writeBase64ToFile(path: string, base64: string): Promise<string> {
  await writeAsStringAsync(path, base64, { encoding: 'base64' });
  return path;
}

export async function collectBackupAssets(
  relatives: Relative[],
  memories: FamilyMemory[],
): Promise<FamilyBackupAssets> {
  const relativePhotos: Record<string, string> = {};
  const memoryPhotos: Record<string, string> = {};

  for (const relative of relatives) {
    const uri = await getLocalRelativePhotoUri(relative.id);
    if (!uri) {
      continue;
    }

    const base64 = await readFileAsBase64(uri);
    if (base64) {
      relativePhotos[relative.id] = base64;
    }
  }

  for (const memory of memories) {
    if (!memory.photoUri) {
      continue;
    }

    const base64 = await readFileAsBase64(memory.photoUri);
    if (base64) {
      memoryPhotos[memory.id] = base64;
    }
  }

  return {
    relativePhotos: Object.keys(relativePhotos).length > 0 ? relativePhotos : undefined,
    memoryPhotos: Object.keys(memoryPhotos).length > 0 ? memoryPhotos : undefined,
  };
}

export async function restoreRelativePhotosFromAssets(
  assets?: FamilyBackupAssets,
): Promise<number> {
  if (!assets?.relativePhotos || !documentDirectory) {
    return 0;
  }

  const relativePhotosDir = `${documentDirectory}relative-photos/`;
  const dirInfo = await getInfoAsync(relativePhotosDir);
  if (!dirInfo.exists) {
    await makeDirectoryAsync(relativePhotosDir, { intermediates: true });
  }

  let restored = 0;

  for (const [relativeId, base64] of Object.entries(assets.relativePhotos)) {
    const destination = `${documentDirectory}relative-photos/${relativeId}.jpg`;
    await writeBase64ToFile(destination, base64);
    await registerLocalRelativePhotoUri(relativeId, destination);
    restored += 1;
  }

  return restored;
}

export async function restoreMemoryPhotosFromAssets(
  memories: FamilyMemory[],
  assets?: FamilyBackupAssets,
): Promise<FamilyMemory[]> {
  if (!assets?.memoryPhotos || !documentDirectory) {
    return memories;
  }

  const memoryPhotosDir = `${documentDirectory}memory-photos/`;
  const dirInfo = await getInfoAsync(memoryPhotosDir);
  if (!dirInfo.exists) {
    await makeDirectoryAsync(memoryPhotosDir, { intermediates: true });
  }

  const next = [...memories];

  for (let index = 0; index < next.length; index += 1) {
    const memory = next[index];
    const base64 = assets.memoryPhotos[memory.id];
    if (!base64) {
      continue;
    }

    const destination = `${documentDirectory}memory-photos/${memory.id}.jpg`;
    await writeBase64ToFile(destination, base64);
    await registerLocalMemoryPhotoUri(memory.id, destination);
    next[index] = {
      ...memory,
      photoUri: destination,
      hasPhoto: true,
    };
  }

  return next;
}

export async function writeBackupJsonFile(fileName: string, json: string): Promise<string> {
  await ensureBackupDir();
  const uri = `${BACKUP_DIR}${fileName}`;
  await writeAsStringAsync(uri, json, { encoding: 'utf8' });
  return uri;
}

export async function writeLocalLatestBackup(
  familyId: string,
  fileName: string,
  json: string,
): Promise<string> {
  await ensureBackupDir();
  const familyDir = `${BACKUP_DIR}${familyId}/`;
  const familyInfo = await getInfoAsync(familyDir);
  if (!familyInfo.exists) {
    await makeDirectoryAsync(familyDir, { intermediates: true });
  }

  const latestUri = `${familyDir}latest.json`;
  await writeAsStringAsync(latestUri, json, { encoding: 'utf8' });
  await writeAsStringAsync(`${familyDir}${fileName}`, json, { encoding: 'utf8' });
  return latestUri;
}

export async function readTextFile(uri: string): Promise<string> {
  return readAsStringAsync(uri, { encoding: 'utf8' });
}

export function getBackupCacheFileName(familyId: string): string {
  return `export-${familyId}-${Date.now()}.json`;
}

export function getBackupPdfFileName(familyId: string): string {
  return `shanyraq-${familyId}-${Date.now()}.pdf`;
}
