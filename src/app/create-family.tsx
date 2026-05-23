import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useFamily } from '@/hooks/useFamily';
import { formatInviteCodeDisplay } from '@/utils/family-invite';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function CreateFamilyScreen() {
  const router = useRouter();
  const { createFamily } = useFamily();
  const [familyName, setFamilyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [errors, setErrors] = useState<{ familyName?: string; ownerName?: string }>({});
  const [saving, setSaving] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  };

  const handleCreate = async () => {
    if (saving) {
      return;
    }

    const nextErrors: { familyName?: string; ownerName?: string } = {};

    if (!familyName.trim()) {
      nextErrors.familyName = 'Введите название семьи.';
    }

    if (!ownerName.trim()) {
      nextErrors.ownerName = 'Введите ваше имя.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);

    try {
      const session = await createFamily({
        familyName: familyName.trim(),
        ownerName: ownerName.trim(),
      });

      router.replace('/(tabs)');

      Alert.alert(
        'Отбасы құрылды!',
        `${session.familyName} — семья создана.\n\nКод приглашения: ${formatInviteCodeDisplay(session.inviteCode)}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось создать семью.';
      Alert.alert('Қате · Ошибка', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>← Артқа</Text>
          </Pressable>
          <Text style={styles.title}>Создать семью</Text>
          <Text style={styles.subtitle}>Жаңа отбасы · Your private family space</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <FormField
            label="Отбасы атауы · Название семьи *"
            placeholder="Мысалы: Қасымовтар"
            value={familyName}
            onChangeText={(value) => {
              setFamilyName(value);
              setErrors((current) => ({ ...current, familyName: undefined }));
            }}
            error={errors.familyName}
            autoCapitalize="words"
          />

          <FormField
            label="Сіздің атыңыз · Ваше имя *"
            placeholder="Мысалы: Нұрлан"
            value={ownerName}
            onChangeText={(value) => {
              setOwnerName(value);
              setErrors((current) => ({ ...current, ownerName: undefined }));
            }}
            error={errors.ownerName}
            autoCapitalize="words"
            hint="Вы будете владельцем семьи · owner"
          />

          <PrimaryButton
            label={saving ? 'Создаём...' : 'Создать семью'}
            sublabel="Локально · AsyncStorage"
            variant="green"
            onPress={saving ? undefined : () => void handleCreate()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.cream,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  backText: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  title: {
    ...Typography.hero,
    color: Palette.greenDeep,
  },
  subtitle: {
    ...Typography.body,
    color: Palette.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
});
