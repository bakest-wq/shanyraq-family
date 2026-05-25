import { Alert, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { FAMILY_MEMORIES_COPY } from '@/constants/family-memories-content';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type MemoryPhotoPickerProps = {
  photoUri?: string | null;
  onChange: (photoUri: string | null) => void;
};

async function requestPhotoPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return true;
  }

  const library = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (library.granted) {
    return true;
  }

  Alert.alert('Рұқсат жоқ', 'Фото таңдау үшін галереяға рұқсат беріңіз.');
  return false;
}

export function MemoryPhotoPicker({ photoUri, onChange }: MemoryPhotoPickerProps) {
  const handlePick = async () => {
    const allowed = await requestPhotoPermission();
    if (!allowed) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: Platform.OS !== 'web',
      aspect: [4, 3],
      quality: 0.85,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    onChange(result.assets[0].uri);
  };

  const handleRemove = () => {
    Alert.alert(FAMILY_MEMORIES_COPY.form.photoRemove, FAMILY_MEMORIES_COPY.deleteConfirmHint, [
      { text: FAMILY_MEMORIES_COPY.cancelAction, style: 'cancel' },
      { text: FAMILY_MEMORIES_COPY.form.photoRemove, onPress: () => onChange(null) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{FAMILY_MEMORIES_COPY.form.photo}</Text>
      <Pressable
        onPress={() => void handlePick()}
        style={({ pressed }) => [styles.upload, photoUri && styles.uploadFilled, pressed && styles.pressed]}>
        {photoUri ? (
          <>
            <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="cover" />
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>{FAMILY_MEMORIES_COPY.form.photoChange}</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.icon}>📷</Text>
            <Text style={styles.placeholderTitle}>{FAMILY_MEMORIES_COPY.form.photoAdd}</Text>
          </>
        )}
      </Pressable>
      {photoUri ? (
        <Pressable onPress={handleRemove} hitSlop={8}>
          <Text style={styles.removeText}>{FAMILY_MEMORIES_COPY.form.photoRemove}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  label: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  upload: {
    minHeight: 200,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Palette.goldLight,
    borderStyle: 'dashed',
    backgroundColor: Palette.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  uploadFilled: {
    borderStyle: 'solid',
  },
  pressed: {
    opacity: 0.92,
  },
  icon: {
    fontSize: 40,
  },
  placeholderTitle: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(27, 67, 50, 0.72)',
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  overlayText: {
    ...Typography.caption,
    color: Palette.white,
    fontWeight: '700',
  },
  removeText: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '700',
    textAlign: 'center',
  },
});
