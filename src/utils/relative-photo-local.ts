import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  copyAsync,
  deleteAsync,
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
} from 'expo-file-system/legacy';

import { Relative } from '@/types/relative';

const LOCAL_PHOTOS_KEY = '@shanyraq/relative-photo-uris';
const PHOTOS_DIR = `${documentDirectory ?? ''}relative-photos/`;

type LocalPhotoMap = Record<string, string>;

async function readLocalPhotoMap(): Promise<LocalPhotoMap> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_PHOTOS_KEY);
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
  await AsyncStorage.setItem(LOCAL_PHOTOS_KEY, JSON.stringify(map));
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

export async function saveRelativePhotoLocally(relativeId: string, sourceUri: string): Promise<string> {
  await ensurePhotosDir();
  const destination = `${PHOTOS_DIR}${relativeId}.jpg`;

  await copyAsync({ from: sourceUri, to: destination });

  const map = await readLocalPhotoMap();
  map[relativeId] = destination;
  await writeLocalPhotoMap(map);

  return destination;
}

export async function getLocalRelativePhotoUri(relativeId: string): Promise<string | null> {
  const map = await readLocalPhotoMap();
  const uri = map[relativeId];

  if (!uri) {
    return null;
  }

  const info = await getInfoAsync(uri);
  return info.exists ? uri : null;
}

export async function removeLocalRelativePhoto(relativeId: string): Promise<void> {
  const map = await readLocalPhotoMap();
  const uri = map[relativeId];

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

  delete map[relativeId];
  await writeLocalPhotoMap(map);
}

export async function enrichRelativesWithLocalPhotos(relatives: Relative[]): Promise<Relative[]> {
  const map = await readLocalPhotoMap();

  return relatives.map((relative) => {
    if (relative.photoUrl) {
      return relative;
    }

    const localUri = map[relative.id];
    return localUri ? { ...relative, photoUrl: localUri } : relative;
  });
}

export async function enrichRelativeWithLocalPhoto(relative: Relative): Promise<Relative> {
  if (relative.photoUrl) {
    return relative;
  }

  const localUri = await getLocalRelativePhotoUri(relative.id);
  if (!localUri) {
    return relative;
  }

  return {
    ...relative,
    photoUrl: localUri,
  };
}
