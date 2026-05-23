import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RelativeFormFields } from '@/components/relatives/RelativeFormFields';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useCreateRelative, useRelatives } from '@/hooks/useRelatives';
import { useToast } from '@/hooks/useToast';
import { CreateRelativeInput } from '@/types/relative';
import { EMPTY_RELATIVE_FORM } from '@/utils/relative-form';
import { hasFormErrors, prepareRelativeInput, validateRelativeForm } from '@/utils/validation';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function AddRelativeScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { createRelative, saving, error: saveError } = useCreateRelative();
  const { relatives } = useRelatives();
  const [form, setForm] = useState<CreateRelativeInput>(EMPTY_RELATIVE_FORM);
  const [errors, setErrors] = useState<ReturnType<typeof validateRelativeForm>>({});

  const updateForm = <K extends keyof CreateRelativeInput>(
    key: K,
    value: CreateRelativeInput[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async () => {
    if (saving) {
      return;
    }

    const prepared = prepareRelativeInput(form);
    const nextErrors = validateRelativeForm(prepared);
    setErrors(nextErrors);

    if (hasFormErrors(nextErrors)) {
      return;
    }

    try {
      const created = await createRelative(prepared);

      if (!created) {
        throw new Error(saveError ?? 'Не удалось сохранить родственника.');
      }

      setForm(EMPTY_RELATIVE_FORM);
      setErrors({});

      showToast({
        type: 'success',
        title: 'Туыс сәтті қосылды 🌿',
        message: 'Родственник успешно добавлен',
      });

      router.replace({
        pathname: '/(tabs)/relatives',
        params: { highlightId: created.id },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось сохранить родственника.';

      showToast({
        type: 'error',
        title: 'Қате · Ошибка',
        message,
      });
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
          <Text style={styles.title}>Туыс қосу</Text>
          <Text style={styles.subtitle}>Добавить родственника</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <RelativeFormFields
            form={form}
            errors={errors}
            saveError={saveError}
            relatives={relatives}
            onChange={updateForm}
          />

          <View style={styles.saveWrap}>
            <PrimaryButton
              label={saving ? 'Сақталуда...' : 'Сохранить'}
              sublabel="Отбасыға қосу · Save to family"
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
