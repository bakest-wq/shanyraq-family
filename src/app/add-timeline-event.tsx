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

import { TimelineEventFormFields } from '@/components/timeline/TimelineEventFormFields';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAddTimelineEvent } from '@/hooks/useTimeline';
import { useRelatives } from '@/hooks/useRelatives';
import { CreateTimelineEventInput } from '@/types/timeline';
import {
  hasTimelineFormErrors,
  validateTimelineForm,
} from '@/utils/timeline-validation';
import { Palette, Spacing, Typography } from '@/constants/theme';

const EMPTY_TIMELINE_FORM: CreateTimelineEventInput = {
  type: 'custom',
  title: '',
  year: '',
  month: '',
  day: '',
  description: '',
  relativeIds: [],
  relativeNames: [],
};

export default function AddTimelineEventScreen() {
  const router = useRouter();
  const { relatives } = useRelatives();
  const { saveEvent, saving, error: saveError } = useAddTimelineEvent();
  const [form, setForm] = useState<CreateTimelineEventInput>(EMPTY_TIMELINE_FORM);
  const [errors, setErrors] = useState<ReturnType<typeof validateTimelineForm>>({});

  const updateForm = <K extends keyof CreateTimelineEventInput>(
    key: K,
    value: CreateTimelineEventInput[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async () => {
    const nextErrors = validateTimelineForm(form);
    setErrors(nextErrors);

    if (hasTimelineFormErrors(nextErrors)) {
      return;
    }

    const created = await saveEvent({
      ...form,
      title: form.title.trim(),
      year: form.year.trim(),
      month: form.month?.trim() ?? '',
      day: form.day?.trim() ?? '',
      description: form.description.trim(),
    });

    if (created) {
      Alert.alert(
        'Сақталды 🌿',
        'Оқиға отбасы хронологиясына қосылды.\n\nЛокально · Supabase кейін',
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
          <Text style={styles.title}>Оқиға қосу</Text>
          <Text style={styles.subtitle}>Отбасы хронологиясы · Add event</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <TimelineEventFormFields
            form={form}
            errors={errors}
            saveError={saveError}
            relatives={relatives}
            onChange={updateForm}
          />

          <View style={styles.saveWrap}>
            <PrimaryButton
              label={saving ? 'Сақталуда...' : 'Оқиғаны сақтау'}
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
