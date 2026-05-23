import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { useFamilyContext } from '@/providers/FamilyProvider';
import { attachRelativePhoto } from '@/services/relative-photo.service';
import { relativesService } from '@/services/relatives.service';
import { CreateRelativeInput } from '@/types/relative';
import {
  hasChildLinkChanges,
  resolveParentLinkRole,
  shouldShowChildrenLinkSection,
} from '@/utils/family-child-links';
import { EMPTY_RELATIVE_FORM } from '@/utils/relative-form';
import { hasFormErrors, prepareRelativeInput, validateRelativeForm } from '@/utils/validation';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function AddRelativeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ fatherId?: string; motherId?: string }>();
  const { showToast } = useToast();
  const { familyId } = useFamilyContext();
  const { createRelative, saving, error: saveError } = useCreateRelative();
  const { relatives, refetch } = useRelatives();
  const [form, setForm] = useState<CreateRelativeInput>(EMPTY_RELATIVE_FORM);
  const [errors, setErrors] = useState<ReturnType<typeof validateRelativeForm>>({});
  const [linkedChildIds, setLinkedChildIds] = useState<string[]>([]);

  useEffect(() => {
    const fatherId = Array.isArray(params.fatherId) ? params.fatherId[0] : params.fatherId;
    const motherId = Array.isArray(params.motherId) ? params.motherId[0] : params.motherId;

    if (!fatherId && !motherId) {
      return;
    }

    setForm((current) => ({
      ...current,
      relationship: 'Бала',
      fatherId: fatherId ?? null,
      motherId: motherId ?? null,
    }));
  }, [params.fatherId, params.motherId]);

  useEffect(() => {
    if (!shouldShowChildrenLinkSection(form.relationship)) {
      setLinkedChildIds([]);
    }
  }, [form.relationship]);

  const updateForm = <K extends keyof CreateRelativeInput>(
    key: K,
    value: CreateRelativeInput[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const patchForm = (patch: Partial<CreateRelativeInput>) => {
    setForm((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch) as Array<keyof CreateRelativeInput>) {
        delete next[key];
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (saving) {
      return;
    }

    const prepared = prepareRelativeInput(form);
    const nextErrors = validateRelativeForm(prepared, {
      relatives,
    });
    setErrors(nextErrors);

    if (hasFormErrors(nextErrors)) {
      return;
    }

    try {
      const { pendingPhotoUri, clearPhoto: _clearPhoto, ...relativeInput } = prepared;
      const created = await createRelative(relativeInput);

      if (!created) {
        throw new Error(saveError ?? 'Не удалось сохранить родственника.');
      }

      if (pendingPhotoUri && familyId) {
        try {
          await attachRelativePhoto(created.id, pendingPhotoUri, familyId);
          await refetch({ silent: true });
        } catch {
          showToast({
            type: 'error',
            title: 'Фото сақталмады',
            message: 'Туыс қосылды, бірақ фото сақталмады · Relative saved without photo.',
          });
        }
      }

      let linksSynced = false;
      const parentRole = resolveParentLinkRole(created.gender, created.relationship);

      if (parentRole && familyId && linkedChildIds.length > 0) {
        await relativesService.syncParentChildLinks(
          created.id,
          linkedChildIds,
          parentRole,
          familyId,
          relatives,
        );
        await refetch({ silent: true });
        linksSynced = true;
      }

      setForm(EMPTY_RELATIVE_FORM);
      setLinkedChildIds([]);
      setErrors({});

      if (linksSynced) {
        showToast({
          type: 'success',
          title: 'Байланыстар сақталды 🌿',
          message: 'Связи между родственниками обновлены',
        });
      }

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
            linkedChildIds={linkedChildIds}
            onLinkedChildIdsChange={setLinkedChildIds}
            onChange={updateForm}
            onPatch={patchForm}
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
