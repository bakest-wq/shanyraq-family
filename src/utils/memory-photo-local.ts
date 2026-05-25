import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  copyAsync,
  deleteAsync,
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
} from 'expo-file-system/legacy';

import type { FamilyMemory } from '@/types/archive';

const LOCAL_MEMORY_PHOTOS_KEY = '@shanyraq/memory-photo-uris';
const PHOTOS_DIR = `${documentDirectory ?? ''}memory-photos/`;

type LocalPhotoMap = Record<string, string>;

async function readLocalPhotoMap(): Promise<LocalPhotoMap> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_MEMORY_PHOTOS_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as LocalPhotoMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function writeLocalPhotoMap(map: LocalPhotoMap): Promise<void> {
  await AsyncStorage.setItem(LOCAL_MEMORY_PHOTOS_KEY, JSON.stringify(map));
}

async function ensurePhotosDir(): Promise<void> {
  if (!documentDirectory) {
    return;
  }

  const info = await getInfoAsync(PHOTOS_DIR);
  if (!info.exists) {
    await makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
  }
}

async function isUsablePhotoUri(uri: string): Promise<boolean> {
  if (
    uri.startsWith('blob:') ||
    uri.startsWith('data:') ||
    uri.startsWith('http://') ||
    uri.startsWith('https://')
  ) {
    return true;
  }

  if (Platform.OS === 'web') {
    return true;
  }

  try {
    const info = await getInfoAsync(uri);
    return info.exists;
  } catch {
    return false;
  }
}

export async function saveMemoryPhotoLocally(
  memoryId: string,
  sourceUri: string,
): Promise<string> {
  if (Platform.OS === 'web' || sourceUri.startsWith('blob:') || sourceUri.startsWith('data:')) {
    const map = await readLocalPhotoMap();
    map[memoryId] = sourceUri;
    await writeLocalPhotoMap(map);
    return sourceUri;
  }

  await ensurePhotosDir();
  const destination = `${PHOTOS_DIR}${memoryId}.jpg`;

  await copyAsync({ from: sourceUri, to: destination });

  const map = await readLocalPhotoMap();
  map[memoryId] = destination;
  await writeLocalPhotoMap(map);

  return destination;
}

export async function registerLocalMemoryPhotoUri(memoryId: string, uri: string): Promise<void> {
  const map = await readLocalPhotoMap();
  map[memoryId] = uri;
  await writeLocalPhotoMap(map);
}

export async function removeLocalMemoryPhoto(memoryId: string): Promise<void> {
  const map = await readLocalPhotoMap();
  const uri = map[memoryId];

  if (uri) {
    try {
      const info = await getInfoAsync(uri);
      if (info.exists) {
        await deleteAsync(uri, { idempotent: true });
      }
    } catch {
      // Ignore local delete errors.
    }
  }

  delete map[memoryId];
  await writeLocalPhotoMap(map);
}

export async function enrichMemoriesWithLocalPhotos(
  memories: FamilyMemory[],
): Promise<FamilyMemory[]> {
  const map = await readLocalPhotoMap();

  return Promise.all(
    memories.map(async (memory) => {
      const candidates = [map[memory.id], memory.photoUri].filter(
        (uri): uri is string => Boolean(uri),
      );

      for (const uri of candidates) {
        if (await isUsablePhotoUri(uri)) {
          return {
            ...memory,
            photoUri: uri,
            hasPhoto: true,
          };
        }
      }

      return {
        ...memory,
        photoUri: undefined,
        hasPhoto: false,
      };
    }),
  );
}
