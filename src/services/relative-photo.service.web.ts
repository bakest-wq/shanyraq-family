import { Alert } from 'react-native';

import { Relative } from '@/types/relative';
import {
  removeLocalRelativePhoto,
  saveRelativePhotoLocally,
} from '@/utils/relative-photo-local';

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

export async function pickRelativePhotoUri(): Promise<string | null> {
  Alert.alert(
    'Фото · Photo',
    'Веб-нұсқада фото таңдау шектеулі. Expo Go немесе телефон қолданбасын қолданыңыз.',
  );
  return null;
}

export async function attachRelativePhoto(
  relativeId: string,
  sourceUri: string,
  familyId: string,
): Promise<Relative> {
  const localUri = await saveRelativePhotoLocally(relativeId, sourceUri);
  const updated = await updatePhotoUrlSafe(relativeId, localUri, familyId);

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
  _existingPhotoUrl?: string | null,
): Promise<Relative> {
  await removeLocalRelativePhoto(relativeId);

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
