import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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

import { RelativeFormFields } from '@/components/relatives/RelativeFormFields';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useRelative, useRelatives, useUpdateRelative } from '@/hooks/useRelatives';
import { useToast } from '@/hooks/useToast';
import { useFamilyContext } from '@/providers/FamilyProvider';
import { attachRelativePhoto, removeRelativePhoto } from '@/services/relative-photo.service';
import { relativesService } from '@/services/relatives.service';
import { CreateRelativeInput } from '@/types/relative';
import {
  getLinkedChildIdsForParent,
  hasChildLinkChanges,
  resolveParentLinkRole,
  shouldShowChildrenLinkSection,
} from '@/utils/family-child-links';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { relativeToFormInput } from '@/utils/relative-form';
import { hasFormErrors, prepareRelativeInput, validateRelativeForm } from '@/utils/validation';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function EditRelativeScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const relativeId = Array.isArray(id) ? id[0] : id;
  const { relative, loading } = useRelative(relativeId ?? '');
  const { relatives, refetch } = useRelatives();
  const { familyId } = useFamilyContext();
  const { updateRelative, saving, error: saveError } = useUpdateRelative(relativeId ?? '');
  const [form, setForm] = useState<CreateRelativeInput | null>(null);
  const [errors, setErrors] = useState<ReturnType<typeof validateRelativeForm>>({});
  const [linkedChildIds, setLinkedChildIds] = useState<string[]>([]);
  const loadedChildRoleKey = useRef<string | null>(null);

  useEffect(() => {
    if (relative) {
      setForm(relativeToFormInput(relative));
    }
  }, [relative]);

  useEffect(() => {
    loadedChildRoleKey.current = null;
    setLinkedChildIds([]);
  }, [relativeId]);

  useEffect(() => {
    if (!form || !relativeId) {
      return;
    }

    const parentRole = resolveParentLinkRole(form.gender, form.relationship);
    const roleKey =
      parentRole && shouldShowChildrenLinkSection(form.relationship)
        ? `${relativeId}:${parentRole}`
        : null;

    if (roleKey === loadedChildRoleKey.current) {
      return;
    }

    loadedChildRoleKey.current = roleKey;

    if (!roleKey || !parentRole) {
      setLinkedChildIds([]);
      return;
    }

    setLinkedChildIds(getLinkedChildIdsForParent(relativeId, relatives, parentRole));
  }, [form, relativeId, relatives]);

  const updateForm = <K extends keyof CreateRelativeInput>(
    key: K,
    value: CreateRelativeInput[K],
  ) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const patchForm = (patch: Partial<CreateRelativeInput>) => {
    setForm((current) => (current ? { ...current, ...patch } : current));
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch) as Array<keyof CreateRelativeInput>) {
        delete next[key];
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!form || !relativeId) {
      return;
    }

    const prepared = prepareRelativeInput(form);
    const nextErrors = validateRelativeForm(prepared, {
      relativeId,
      relatives,
      subjectGender: relative?.gender,
    });
    setErrors(nextErrors);

    if (hasFormErrors(nextErrors)) {
      return;
    }

    const { pendingPhotoUri, clearPhoto, ...relativeInput } = prepared;
    const updated = await updateRelative(relativeInput);
    let linksSynced = false;

    if (updated && familyId) {
      const parentRole = resolveParentLinkRole(updated.gender, updated.relationship);

      if (
        parentRole &&
        hasChildLinkChanges(linkedChildIds, relativeId, relatives, parentRole)
      ) {
        await relativesService.syncParentChildLinks(
          relativeId,
          linkedChildIds,
          parentRole,
          familyId,
          relatives,
        );
        await refetch({ silent: true });
        linksSynced = true;
      }

      try {
        if (clearPhoto && relative?.photoUrl) {
          await removeRelativePhoto(relativeId, familyId, relative.photoUrl);
        }

        if (pendingPhotoUri) {
          await attachRelativePhoto(relativeId, pendingPhotoUri, familyId);
        }

        if (!linksSynced) {
          await refetch({ silent: true });
        }
      } catch {
        Alert.alert(
          'Фото · Photo',
          'Данные сохранены, но фото не обновилось. Попробуйте ещё раз.',
        );
      }
    }

    if (updated) {
      if (linksSynced) {
        showToast({
          type: 'success',
          title: 'Байланыстар сақталды 🌿',
          message: 'Связи между родственниками обновлены',
        });
      }

      Alert.alert(
        'Сәтті жаңартылды!',
        `${getRelativeDisplayName(updated)} успешно обновлён.`,
        [
          {
            text: 'Жарайды',
            onPress: () =>
              router.replace({
                pathname: '/relative/[id]',
                params: { id: relativeId },
              }),
          },
        ],
      );
    }
  };

  if (!relativeId) {
    return null;
  }

  if (loading && !form) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState message="Жүктелуде · Загрузка..." />
      </SafeAreaView>
    );
  }

  if (!form) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Родственник не найден</Text>
          <PrimaryButton label="Назад" variant="gold" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Артқа</Text>
          </Pressable>
          <Text style={styles.title}>Өңдеу</Text>
          <Text style={styles.subtitle}>Редактировать родственника</Text>
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
            editingRelativeId={relativeId}
            linkedChildIds={linkedChildIds}
            onLinkedChildIdsChange={setLinkedChildIds}
            onChange={updateForm}
            onPatch={patchForm}
          />

          <View style={styles.saveWrap}>
            <PrimaryButton
              label={saving ? 'Сохранение...' : 'Сохранить изменения'}
              sublabel="Жаңарту · Update relative"
              variant="green"
              onPress={saving ? undefined : handleSubmit}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.lg,
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
  errorText: {
    ...Typography.body,
    color: Palette.danger,
    textAlign: 'center',
  },
});
