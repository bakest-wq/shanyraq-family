import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
import { DuplicateRelativeHint } from '@/components/relatives/DuplicateRelativeHint';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { HelperHintBanner } from '@/components/ui/HelperHintBanner';
import { kk, FAMILY_LANGUAGE, ru } from '@/content/family-language';
import { useCreateRelative, useRelatives } from '@/hooks/useRelatives';
import { useSafeGoBack } from '@/hooks/useSafeGoBack';
import { useToast } from '@/hooks/useToast';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { useFamilyContext } from '@/providers/FamilyProvider';
import { saveAndSyncPhotoUrl } from '@/services/relative-photo.service';
import { detectHighConfidenceDuplicates } from '@/services/duplicate-relative.service';
import {
  applyPendingRootLinkAfterSave,
  type PendingRootLinkAfterSave,
} from '@/services/guided-family-builder.service';
import { relativesService } from '@/services/relatives.service';
import { CreateRelativeInput, ConnectParentsInput } from '@/types/relative';
import {
  hasChildLinkChanges,
  resolveParentLinkRole,
} from '@/utils/family-child-links';
import { resolveFamilyLinkFormLayout } from '@/utils/family-link-modes';
import { findRelativeByLinkId } from '@/utils/family-link-picker';
import { EMPTY_RELATIVE_FORM } from '@/utils/relative-form';
import { getAddRelativeContextHelper } from '@/utils/jurt-actions';
import {
  getMissingLinkContextHelper,
  isMissingLinkContext,
  resolveMissingLinkSavePatches,
  shouldReturnToShezhireAfterSave,
} from '@/utils/missing-link-actions';
import { getSpouse } from '@/utils/shezhire-lineage';
import { hasFormErrors, prepareRelativeInput, validateRelativeForm } from '@/utils/validation';
import {
  getRelationshipSaveErrorMessage,
  isRelationshipSafetyBlockedError,
  PROPOSED_RELATIVE_ID,
} from '@/utils/relationship-safety-validation';
import { confirmDuplicateRelativeProceed } from '@/utils/confirm-action';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function AddRelativeScreen() {
  const router = useRouter();
  const goBack = useSafeGoBack();
  const params = useLocalSearchParams<{
    fatherId?: string;
    father_id?: string;
    motherId?: string;
    mother_id?: string;
    relationship?: string;
    context?: string;
    rootId?: string;
    spouseId?: string;
    fromSetup?: string;
    linkAsUser?: string;
    targetRelativeId?: string;
    target_relative_id?: string;
    parentRelativeId?: string;
    parent_relative_id?: string;
    gender?: string;
    returnTo?: string;
  }>();
  const { showToast } = useToast();
  const { familyId } = useFamilyContext();
  const { linkRelative, hasLinkedRelative } = useUserIdentity();
  const { createRelative, saving, error: saveError } = useCreateRelative();
  const { relatives, refetch } = useRelatives();
  const [form, setForm] = useState<CreateRelativeInput>(EMPTY_RELATIVE_FORM);
  const [errors, setErrors] = useState<ReturnType<typeof validateRelativeForm>>({});
  const [linkedChildIds, setLinkedChildIds] = useState<string[]>([]);
  const [pendingSiblingSync, setPendingSiblingSync] = useState<{
    siblingId: string;
    patch: Partial<ConnectParentsInput>;
  } | null>(null);
  const [pendingRootLink, setPendingRootLink] = useState<PendingRootLinkAfterSave | null>(null);

  const referenceRootId = useMemo(() => {
    const rootId = Array.isArray(params.rootId) ? params.rootId[0] : params.rootId;
    return rootId ?? null;
  }, [params.rootId]);

  const shouldLinkAsUser = useMemo(() => {
    const value = Array.isArray(params.linkAsUser) ? params.linkAsUser[0] : params.linkAsUser;
    return value === '1' || value === 'true';
  }, [params.linkAsUser]);

  const routeContext = useMemo(() => {
    const context = Array.isArray(params.context) ? params.context[0] : params.context;
    return context ?? null;
  }, [params.context]);

  const targetRelativeId = useMemo(() => {
    const value =
      (Array.isArray(params.targetRelativeId)
        ? params.targetRelativeId[0]
        : params.targetRelativeId) ??
      (Array.isArray(params.target_relative_id)
        ? params.target_relative_id[0]
        : params.target_relative_id);
    return value ?? null;
  }, [params.targetRelativeId, params.target_relative_id]);

  const routeGender = useMemo(() => {
    const gender = Array.isArray(params.gender) ? params.gender[0] : params.gender;
    return gender === 'male' || gender === 'female' ? gender : null;
  }, [params.gender]);

  const returnToShezhire = useMemo(
    () =>
      shouldReturnToShezhireAfterSave(
        Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo,
        routeContext,
      ),
    [params.returnTo, routeContext],
  );

  const routeRelationship = useMemo(() => {
    const relationship = Array.isArray(params.relationship)
      ? params.relationship[0]
      : params.relationship;
    return relationship ?? null;
  }, [params.relationship]);

  const contextHelperText = useMemo(() => {
    if (isMissingLinkContext(routeContext)) {
      return getMissingLinkContextHelper(routeContext);
    }

    return getAddRelativeContextHelper(routeContext);
  }, [routeContext]);

  useEffect(() => {
    const fatherId =
      (Array.isArray(params.fatherId) ? params.fatherId[0] : params.fatherId) ??
      (Array.isArray(params.father_id) ? params.father_id[0] : params.father_id);
    const motherId =
      (Array.isArray(params.motherId) ? params.motherId[0] : params.motherId) ??
      (Array.isArray(params.mother_id) ? params.mother_id[0] : params.mother_id);
    const spouseId = Array.isArray(params.spouseId) ? params.spouseId[0] : params.spouseId;

    if (!fatherId && !motherId && !routeRelationship && !isMissingLinkContext(routeContext)) {
      return;
    }

    setForm((current) => ({
      ...current,
      ...(routeRelationship ? { relationship: routeRelationship } : {}),
      ...(routeGender ? { gender: routeGender } : {}),
      ...(spouseId ? { spouseId } : {}),
      ...(fatherId || motherId
        ? {
            relationship: routeRelationship ?? 'Бала',
            fatherId: fatherId ?? null,
            motherId: motherId ?? null,
          }
        : {}),
    }));
  }, [
    params.fatherId,
    params.father_id,
    params.motherId,
    params.mother_id,
    params.spouseId,
    routeContext,
    routeGender,
    routeRelationship,
  ]);

  useEffect(() => {
    if (!resolveFamilyLinkFormLayout(form.relationship).showChildrenPicker) {
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

  const handleSiblingParentSync = (siblingId: string, patch: Partial<CreateRelativeInput>) => {
    setPendingSiblingSync({
      siblingId,
      patch: {
        fatherId: patch.fatherId,
        motherId: patch.motherId,
      },
    });
  };

  const preparedForm = useMemo(() => prepareRelativeInput(form), [form]);

  const duplicateDetection = useMemo(
    () => detectHighConfidenceDuplicates(preparedForm, relatives),
    [preparedForm, relatives],
  );

  const performCreate = async () => {
    try {
      const { pendingPhotoUri, clearPhoto: _clearPhoto, ...relativeInput } = preparedForm;
      const created = await createRelative(relativeInput, {
        allowMemberSelfAdd: shouldLinkAsUser && !hasLinkedRelative,
      });

      if (!created) {
        throw new Error(saveError ?? 'Не удалось сохранить родственника.');
      }

      if (pendingPhotoUri && familyId) {
        try {
          await saveAndSyncPhotoUrl(created.id, pendingPhotoUri, familyId);
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

      if (pendingSiblingSync && familyId) {
        await relativesService.patchRelativeLinks(
          pendingSiblingSync.siblingId,
          pendingSiblingSync.patch,
          familyId,
        );
        await refetch({ silent: true });
        linksSynced = true;
        setPendingSiblingSync(null);
      }

      if (pendingRootLink && familyId) {
        await relativesService.patchRelativeLinks(
          pendingRootLink.rootPersonId,
          applyPendingRootLinkAfterSave(pendingRootLink, created.id),
          familyId,
        );
        await refetch({ silent: true });
        linksSynced = true;
        setPendingRootLink(null);
      }

      if (isMissingLinkContext(routeContext) && targetRelativeId && familyId) {
        const targetPerson = findRelativeByLinkId(relatives, targetRelativeId);
        const spousePerson = targetPerson
          ? getSpouse(targetPerson, relatives)
          : null;
        const missingLinkPatches = resolveMissingLinkSavePatches(
          routeContext,
          targetRelativeId,
          created.id,
          { targetPerson, spouse: spousePerson },
        );

        for (const { personId, patch } of missingLinkPatches) {
          await relativesService.patchRelativeLinks(personId, patch, familyId);
          linksSynced = true;
        }

        if (missingLinkPatches.length > 0) {
          await refetch({ silent: true });
        }
      }

      setForm(EMPTY_RELATIVE_FORM);
      setLinkedChildIds([]);
      setErrors({});

      if (linksSynced || isMissingLinkContext(routeContext)) {
        showToast({
          type: 'success',
          title: kk(FAMILY_LANGUAGE.success.linkAdded),
          message: ru(FAMILY_LANGUAGE.success.linkAdded),
        });
      } else {
        showToast({
          type: 'success',
          title: kk(FAMILY_LANGUAGE.success.relativeAdded),
          message: ru(FAMILY_LANGUAGE.success.relativeAdded),
        });
      }

      if (
        shouldLinkAsUser ||
        (!hasLinkedRelative &&
          (relativeInput.relationship === 'Мен' || relativeInput.relationship === 'Я'))
      ) {
        await linkRelative(created.id);
      }

      if (returnToShezhire) {
        router.replace({
          pathname: '/(tabs)/shezhire',
          params: referenceRootId ? { focusRootId: referenceRootId } : {},
        });
        return;
      }

      const returnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
      const profileReturnId =
        targetRelativeId ??
        (Array.isArray(params.targetRelativeId)
          ? params.targetRelativeId[0]
          : params.targetRelativeId) ??
        created.id;

      if (returnTo === 'details' && profileReturnId) {
        router.replace({
          pathname: '/relative/[id]',
          params: { id: profileReturnId },
        });
        return;
      }

      router.replace({
        pathname: shouldLinkAsUser ? '/(tabs)/shezhire' : '/(tabs)/relatives',
        params: shouldLinkAsUser ? {} : { highlightId: created.id },
      });
    } catch (err) {
      if (isRelationshipSafetyBlockedError(err)) {
        setErrors((current) => ({ ...current, ...err.fieldErrors }));
      }

      showToast({
        type: 'error',
        title: 'Сақтау мүмкін емес',
        message: getRelationshipSaveErrorMessage(err),
      });
    }
  };

  const handleSubmit = async () => {
    if (saving) {
      return;
    }

    const parentRole = resolveParentLinkRole(preparedForm.gender, preparedForm.relationship);
    const nextErrors = validateRelativeForm(preparedForm, {
      relatives,
      relativeId: PROPOSED_RELATIVE_ID,
      linkedChildIds: parentRole ? linkedChildIds : undefined,
      parentLinkRole: parentRole ?? undefined,
    });
    setErrors(nextErrors);

    if (hasFormErrors(nextErrors)) {
      return;
    }

    if (duplicateDetection.hasHighConfidence && duplicateDetection.topMatch) {
      const topMatchId = duplicateDetection.topMatch.relativeId;
      confirmDuplicateRelativeProceed(
        () => {
          router.push({
            pathname: '/relative/[id]',
            params: { id: topMatchId },
          });
        },
        () => {
          void performCreate();
        },
      );
      return;
    }

    await performCreate();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Text style={styles.backText}>← Артқа</Text>
          </Pressable>
          <Text style={styles.title}>Туыс қосу</Text>
          <Text style={styles.subtitle}>Добавить родственника</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {contextHelperText ? (
            <HelperHintBanner icon="🌿" text={contextHelperText} tone="cream" />
          ) : null}

          {duplicateDetection.hasHighConfidence ? (
            <DuplicateRelativeHint matches={duplicateDetection.matches} />
          ) : null}

          <RelativeFormFields
            form={form}
            errors={errors}
            saveError={saveError}
            relatives={relatives}
            referenceRootId={referenceRootId}
            linkedChildIds={linkedChildIds}
            onLinkedChildIdsChange={setLinkedChildIds}
            onChange={updateForm}
            onPatch={patchForm}
            onSiblingParentSync={handleSiblingParentSync}
            onPendingRootLinkChange={setPendingRootLink}
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
