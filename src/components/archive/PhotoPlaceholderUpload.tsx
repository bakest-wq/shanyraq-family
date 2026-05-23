import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type PhotoPlaceholderUploadProps = {
  hasPhoto: boolean;
  onChange: (hasPhoto: boolean) => void;
};

export function PhotoPlaceholderUpload({ hasPhoto, onChange }: PhotoPlaceholderUploadProps) {
  const handlePress = () => {
    if (hasPhoto) {
      Alert.alert('Фото', 'Убрать выбранное фото?', [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Убрать', onPress: () => onChange(false) },
      ]);
      return;
    }

    Alert.alert(
      'Загрузка фото',
      'Реальная загрузка будет доступна позже. Сейчас можно только отметить место для фото.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Выбрать (mock)', onPress: () => onChange(true) },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Фото · Photo</Text>
      <Pressable onPress={handlePress} style={({ pressed }) => [styles.upload, pressed && styles.pressed]}>
        {hasPhoto ? (
          <>
            <Text style={styles.icon}>🖼️</Text>
            <Text style={styles.selectedTitle}>Фото выбрано</Text>
            <Text style={styles.hint}>Mock · загрузка позже</Text>
          </>
        ) : (
          <>
            <Text style={styles.icon}>📷</Text>
            <Text style={styles.placeholderTitle}>Добавить фото</Text>
            <Text style={styles.hint}>Нажмите для mock-выбора</Text>
          </>
        )}
      </Pressable>
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
    minHeight: 180,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Palette.goldLight,
    borderStyle: 'dashed',
    backgroundColor: Palette.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.lg,
  },
  pressed: {
    opacity: 0.9,
  },
  icon: {
    fontSize: 40,
  },
  placeholderTitle: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  selectedTitle: {
    ...Typography.body,
    color: Palette.greenMid,
    fontWeight: '700',
  },
  hint: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
});
