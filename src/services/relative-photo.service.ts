import { Alert, Platform } from 'react-native';

import { isSupabaseReady } from '@/lib/supabase';
import { Relative } from '@/types/relative';
import {
  removeLocalRelativePhoto,
  saveRelativePhotoLocally,
} from '@/utils/relative-photo-local';

const STORAGE_BUCKET = 'relative-photos';

async function loadImagePicker() {
  return import('expo-image-picker');
}

async function updatePhotoUrlSafe(
  relativeId: string,
  photoUrl: string | null,
  familyId: string,
): Promise<Relative | null> {
  try {
    const { relativesService } = await import('@/services/relatives.service');
    return await relativesService.updatePhotoUrl(relativeId, photoUrl, familyId);
  } catch {
    return null;
  }
}

export async function requestRelativePhotoPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const ImagePicker = await loadImagePicker();
  const library = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!library.granted) {
    Alert.alert(
      'Рұқсат керек',
      'Фото таңдау үшін галереяға рұқсат беріңіз · Allow photo library access.',
    );
    return false;
  }

  return true;
}

export async function pickRelativePhotoUri(): Promise<string | null> {
  const allowed = await requestRelativePhotoPermission();
  if (!allowed) {
    return null;
  }

  const ImagePicker = await loadImagePicker();
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}

async function uploadRelativePhotoToSupabase(
  familyId: string,
  relativeId: string,
  sourceUri: string,
): Promise<string | null> {
  if (!isSupabaseReady()) {
    return null;
  }

  try {
    const response = await fetch(sourceUri);
    const arrayBuffer = await response.arrayBuffer();
    const path = `${familyId}/${relativeId}.jpg`;
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();

    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, arrayBuffer, {
      upsert: true,
      contentType: 'image/jpeg',
      cacheControl: '3600',
    });

    if (error) {
      return null;
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch {
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

/** Save photo locally first; cloud upload is best-effort only. */
export async function attachRelativePhoto(
  relativeId: string,
  sourceUri: string,
  familyId: string,
): Promise<Relative> {
  const localUri = await saveRelativePhotoLocally(relativeId, sourceUri);
  const remoteUrl = await uploadRelativePhotoToSupabase(familyId, relativeId, sourceUri);
  const photoUrl = remoteUrl ?? localUri;

  const updated = await updatePhotoUrlSafe(relativeId, photoUrl, familyId);
  if (updated) {
    return updated;
  }

  const { relativesService } = await import('@/services/relatives.service');
  const fallback = await relativesService.getById(relativeId, familyId);

  if (fallback) {
    return { ...fallback, photoUrl: localUri };
  }

  throw new Error('Failed to save photo.');
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

  const updated = await updatePhotoUrlSafe(relativeId, null, familyId);
  if (updated) {
    return updated;
  }

  const { relativesService } = await import('@/services/relatives.service');
  const fallback = await relativesService.getById(relativeId, familyId);

  if (fallback) {
    return { ...fallback, photoUrl: undefined };
  }

  throw new Error('Failed to remove photo.');
}
