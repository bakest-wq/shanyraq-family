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

import { MemoryFormFields } from '@/components/archive/MemoryFormFields';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAddMemory } from '@/hooks/useArchive';
import { useRelatives } from '@/hooks/useRelatives';
import { CreateMemoryInput } from '@/types/archive';
import {
  hasMemoryFormErrors,
  validateMemoryForm,
} from '@/utils/archive-validation';
import { Palette, Spacing, Typography } from '@/constants/theme';

const EMPTY_MEMORY_FORM: CreateMemoryInput = {
  title: '',
  relativeId: null,
  relativeName: '',
  year: '',
  story: '',
  category: 'stories',
  hasPhoto: false,
};

export default function AddMemoryScreen() {
  const router = useRouter();
  const { relatives } = useRelatives();
  const { saveMemory, saving, error: saveError } = useAddMemory();
  const [form, setForm] = useState<CreateMemoryInput>(EMPTY_MEMORY_FORM);
  const [errors, setErrors] = useState<ReturnType<typeof validateMemoryForm>>({});

  const updateForm = <K extends keyof CreateMemoryInput>(
    key: K,
    value: CreateMemoryInput[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async () => {
    const nextErrors = validateMemoryForm(form);
    setErrors(nextErrors);

    if (hasMemoryFormErrors(nextErrors)) {
      return;
    }

    const created = await saveMemory({
      ...form,
      title: form.title.trim(),
      relativeName: form.relativeName.trim(),
      year: form.year.trim() || new Date().getFullYear().toString(),
      story: form.story.trim(),
    });

    if (created) {
      Alert.alert(
        'Сақталды!',
        'История добавлена в семейный архив.\n\nMock · без облачного хранилища.',
        [
          {
            text: 'Жарайды',
            onPress: () => router.back(),
          },
        ],
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Артқа</Text>
          </Pressable>
          <Text style={styles.title}>Тарих қосу</Text>
          <Text style={styles.subtitle}>Добавить семейную историю</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <MemoryFormFields
            form={form}
            errors={errors}
            saveError={saveError}
            relatives={relatives}
            onChange={updateForm}
          />

          <View style={styles.saveWrap}>
            <PrimaryButton
              label={saving ? 'Сохранение...' : 'Сохранить историю'}
              sublabel="Локально · Mock без облака"
              variant="green"
              onPress={saving ? undefined : () => void handleSubmit()}
            />
          </View>
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
  saveWrap: {
    paddingTop: Spacing.sm,
  },
});
