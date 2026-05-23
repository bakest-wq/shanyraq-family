import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { isSupabaseReady } from '@/lib/supabase';
import { Relative } from '@/types/relative';
import {
  removeLocalRelativePhoto,
  saveRelativePhotoLocally,
} from '@/utils/relative-photo-local';

const STORAGE_BUCKET = 'relative-photos';

async function updatePhotoUrlInDatabase(
  relativeId: string,
  photoUrl: string | null,
  familyId: string,
): Promise<Relative> {
  if (!isSupabaseReady()) {
    throw new Error('Supabase is not configured.');
  }

  const { relativesService } = await import('@/services/relatives.service');
  return relativesService.updatePhotoUrl(relativeId, photoUrl, familyId);
}

export async function requestRelativePhotoPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return true;
  }

  const library = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (library.granted) {
    return true;
  }

  Alert.alert(
    'Рұқсат жоқ · Permission denied',
    'Фото таңдау үшін галереяға рұқсат беріңіз · Allow photo library access in settings.',
  );
  return false;
}

export async function pickRelativePhotoUri(): Promise<string | null> {
  try {
    const allowed = await requestRelativePhotoPermission();
    if (!allowed) {
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: Platform.OS !== 'web',
      aspect: [1, 1],
      quality: 0.85,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Фото таңдау сәтсіз аяқталды · Failed to pick photo.';

    if (Platform.OS === 'web') {
      Alert.alert(
        'Фото · Photo',
        'Браузерде фото таңдау қолжетімсіз болуы мүмкін. Expo Go немесе мобильді қолданбаны қолданыңыз.',
      );
      return null;
    }

    Alert.alert('Қате · Ошибка', message);
    return null;
  }
}

async function removeRelativePhotoFromSupabase(familyId: string, relativeId: string): Promise<void> {
  if (!isSupabaseReady()) {
    return;
  }

  try {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    await supabase.storage.from(STORAGE_BUCKET).remove([`${familyId}/${relativeId}.jpg`]);
  } catch {
    // Ignore remote delete errors.
  }
}

/** Copies image locally and persists the uri in Supabase `photo_url` (MVP, no Storage upload). */
export async function saveAndSyncPhotoUrl(
  relativeId: string,
  sourceUri: string,
  familyId: string,
): Promise<string> {
  const localUri = await saveRelativePhotoLocally(relativeId, sourceUri);
  await updatePhotoUrlInDatabase(relativeId, localUri, familyId);
  return localUri;
}

/** @deprecated Use saveAndSyncPhotoUrl */
export async function attachRelativePhoto(
  relativeId: string,
  sourceUri: string,
  familyId: string,
): Promise<void> {
  await saveAndSyncPhotoUrl(relativeId, sourceUri, familyId);
}

export async function removeRelativePhoto(
  relativeId: string,
  familyId: string,
  existingPhotoUrl?: string | null,
): Promise<Relative> {
  await removeLocalRelativePhoto(relativeId);

  if (existingPhotoUrl?.includes(STORAGE_BUCKET) || existingPhotoUrl?.includes('supabase')) {
    await removeRelativePhotoFromSupabase(familyId, relativeId);
  }

  return updatePhotoUrlInDatabase(relativeId, null, familyId);
}
