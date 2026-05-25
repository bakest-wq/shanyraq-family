import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
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

export async function resolveRelativePhotoUrl(
  relative: Relative,
  localMap?: LocalPhotoMap,
): Promise<string | undefined> {
  const map = localMap ?? (await readLocalPhotoMap());
  const candidates = [map[relative.id], relative.photoUrl].filter(
    (uri): uri is string => Boolean(uri),
  );

  for (const uri of candidates) {
    if (await isUsablePhotoUri(uri)) {
      return uri;
    }
  }

  return undefined;
}

export async function saveRelativePhotoLocally(relativeId: string, sourceUri: string): Promise<string> {
  if (Platform.OS === 'web' || sourceUri.startsWith('blob:') || sourceUri.startsWith('data:')) {
    const map = await readLocalPhotoMap();
    map[relativeId] = sourceUri;
    await writeLocalPhotoMap(map);
    return sourceUri;
  }

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

  if (await isUsablePhotoUri(uri)) {
    return uri;
  }

  return null;
}

export async function registerLocalRelativePhotoUri(
  relativeId: string,
  uri: string,
): Promise<void> {
  const map = await readLocalPhotoMap();
  map[relativeId] = uri;
  await writeLocalPhotoMap(map);
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

  return Promise.all(
    relatives.map(async (relative) => {
      const photoUrl = await resolveRelativePhotoUrl(relative, map);
      return photoUrl ? { ...relative, photoUrl } : { ...relative, photoUrl: undefined };
    }),
  );
}

export async function enrichRelativeWithLocalPhoto(relative: Relative): Promise<Relative> {
  const photoUrl = await resolveRelativePhotoUrl(relative);
  return photoUrl ? { ...relative, photoUrl } : { ...relative, photoUrl: undefined };
}
