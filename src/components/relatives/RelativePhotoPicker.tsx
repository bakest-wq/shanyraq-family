import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AvatarLoadingOverlay,
  RelativeAvatar,
} from '@/components/ui/RelativeAvatar';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { pickRelativePhotoUri } from '@/services/relative-photo.service';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type RelativePhotoPickerProps = {
  name: string;
  color: string;
  photoUrl?: string | null;
  pendingPhotoUri?: string | null;
  uploading?: boolean;
  variant?: 'form' | 'profile';
  onPhotoSelected: (uri: string) => void;
  onPhotoRemoved: () => void;
};

export function RelativePhotoPicker({
  name,
  color,
  photoUrl,
  pendingPhotoUri,
  uploading = false,
  variant = 'form',
  onPhotoSelected,
  onPhotoRemoved,
}: RelativePhotoPickerProps) {
  const avatarSize = variant === 'profile' ? 112 : 96;
  const displayUri = pendingPhotoUri ?? photoUrl ?? null;
  const hasPhoto = Boolean(displayUri);

  const handlePick = () => {
    if (uploading) {
      return;
    }

    void (async () => {
      const uri = await pickRelativePhotoUri();
      if (uri) {
        onPhotoSelected(uri);
      }
    })();
  };

  const handleRemove = () => {
    if (uploading || !hasPhoto) {
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
          onPress: onPhotoRemoved,
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Профиль фотосы · Photo</Text>
      <Text style={styles.hint}>
        Туысыңыздың жүзін қосыңыз — отбасы тірі сезіледі 🌿
      </Text>

      <View style={styles.avatarBlock}>
        <View style={styles.avatarWrap}>
          <RelativeAvatar
            name={name}
            color={color}
            photoUrl={displayUri}
            size={avatarSize}
          />
          {uploading ? <AvatarLoadingOverlay size={avatarSize} /> : null}
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label={hasPhoto ? 'Фотоны өзгерту · Change' : 'Фото қосу · Add photo'}
            sublabel={uploading ? 'Жүктелуде...' : 'Галереядан таңдау'}
            variant="green"
            onPress={uploading ? undefined : handlePick}
          />

          {hasPhoto ? (
            <Pressable
              onPress={handleRemove}
              disabled={uploading}
              style={({ pressed }) => [
                styles.removeButton,
                pressed && styles.pressed,
                uploading && styles.disabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Remove photo">
              {uploading ? (
                <ActivityIndicator color={Palette.danger} size="small" />
              ) : (
                <Text style={styles.removeLabel}>Фотоны алу · Remove photo</Text>
              )}
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  hint: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    lineHeight: 22,
  },
  avatarBlock: {
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: Palette.creamDark,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Palette.goldLight,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  avatarWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    width: '100%',
    gap: Spacing.sm,
  },
  removeButton: {
    minHeight: 52,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: '#E8C4BC',
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  removeLabel: {
    ...Typography.bodySmall,
    color: Palette.danger,
    fontWeight: '700',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.6,
  },
});
