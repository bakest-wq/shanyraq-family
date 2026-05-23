import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { useFamilyContext } from '@/providers/FamilyProvider';
import { useRelativesContext } from '@/providers/RelativesProvider';
import {
  pickRelativePhotoUri,
  removeRelativePhoto,
  saveAndSyncPhotoUrl,
} from '@/services/relative-photo.service';
import { Relative } from '@/types/relative';

export function useRelativePhoto(relative: Relative | null) {
  const { familyId } = useFamilyContext();
  const { refetch } = useRelativesContext();
  const [uploading, setUploading] = useState(false);

  const pickAndUploadPhoto = useCallback(async () => {
    if (!relative || uploading) {
      return;
    }

    if (!familyId) {
      Alert.alert(
        'Қате · Ошибка',
        'Отбасы таңдалмаған · Family session is missing.',
      );
      return;
    }

    let uri: string | null = null;

    try {
      uri = await pickRelativePhotoUri();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Фото таңдау сәтсіз аяқталды · Failed to pick photo.';
      Alert.alert('Қате · Ошибка', message);
      return;
    }

    if (!uri) {
      return;
    }

    setUploading(true);

    try {
      await saveAndSyncPhotoUrl(relative.id, uri, familyId);
      await refetch({ silent: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Фото сақталмады.';
      Alert.alert('Қате · Ошибка', message);
    } finally {
      setUploading(false);
    }
  }, [relative, familyId, uploading, refetch]);

  const removePhoto = useCallback(() => {
    if (!relative || !familyId || uploading) {
      return;
    }

    Alert.alert(
      'Фотоны алу · Удалить фото',
      'Профиль фотосын жойғыңыз келе ме?',
      [
        { text: 'Болдырмау', style: 'cancel' },
        {
          text: 'Жою · Удалить',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setUploading(true);

              try {
                await removeRelativePhoto(relative.id, familyId, relative.photoUrl);
                await refetch({ silent: true });
              } catch (err) {
                const message = err instanceof Error ? err.message : 'Фото жойылмады.';
                Alert.alert('Қате · Ошибка', message);
              } finally {
                setUploading(false);
              }
            })();
          },
        },
      ],
    );
  }, [relative, familyId, uploading, refetch]);

  return {
    uploading,
    pickAndUploadPhoto,
    removePhoto,
  };
}
