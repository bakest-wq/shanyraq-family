import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { BirthdayPicker } from '@/components/relatives/BirthdayPicker';
import { FamilyLinkSections } from '@/components/relatives/FamilyLinkSections';
import { GuidedLinkingAssistant } from '@/components/relatives/GuidedLinkingAssistant';
import { RelativePhotoPicker } from '@/components/relatives/RelativePhotoPicker';
import { RuPicker } from '@/components/relatives/RuPicker';
import { RelationshipSelector } from '@/components/relatives/RelationshipSelector';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { HelperHintBanner } from '@/components/ui/HelperHintBanner';
import { DisclosureSection } from '@/components/ui/motion/DisclosureSection';
import {
  CreateRelativeInput,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  Relative,
} from '@/types/relative';
import { useKinshipAnchor } from '@/hooks/useKinshipAnchor';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import {
  buildGuidedFamilyStep,
  resolvePendingRootLinkPatch,
  type GuidedLinkAction,
  type PendingRootLinkAfterSave,
} from '@/services/guided-family-builder.service';
import { buildKinshipCardLineMap } from '@/services/kinship.service';
import { SECTION_HELPER_TEXT } from '@/constants/family-ux-content';
import { COGNITIVE_LOAD_COPY } from '@/constants/cognitive-load-content';
import { getRelativeDisplayName } from '@/utils/relative-names';
import {
  getParentSideAutoLabelHelperText,
  getParentSideSiblingHelperText,
  isParentSideSiblingRelationship,
} from '@/utils/parent-side-sibling-add';
import { syncBirthdayFields } from '@/utils/birthday-parts';
import { pickAvatarColor } from '@/utils/relative.mapper';
import { RelativeFormErrors } from '@/utils/validation';
import { RuSelection } from '@/utils/ru-dictionary';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type RelativeFormFieldsProps = {
  form: CreateRelativeInput;
  errors: RelativeFormErrors;
  saveError?: string | null;
  relatives: Relative[];
  editingRelativeId?: string;
  referenceRootId?: string | null;
  linkedChildIds?: string[];
  onLinkedChildIdsChange?: (ids: string[]) => void;
  onChange: <K extends keyof CreateRelativeInput>(
    key: K,
    value: CreateRelativeInput[K],
  ) => void;
  onPatch?: (patch: Partial<CreateRelativeInput>) => void;
  onSiblingParentSync?: (siblingId: string, patch: Partial<CreateRelativeInput>) => void;
  onPendingRootLinkChange?: (pending: PendingRootLinkAfterSave | null) => void;
};

export function RelativeFormFields({
  form,
  errors,
  saveError,
  relatives,
  editingRelativeId,
  referenceRootId,
  linkedChildIds = [],
  onLinkedChildIdsChange,
  onChange,
  onPatch,
  onSiblingParentSync,
  onPendingRootLinkChange,
}: RelativeFormFieldsProps) {
  const router = useRouter();
  const { myRelative } = useUserIdentity();
  const anchorPerson = useKinshipAnchor();
  const [dismissedStepIds, setDismissedStepIds] = useState<Set<string>>(() => new Set());
  const [confirmedRootParentLink, setConfirmedRootParentLink] = useState(false);

  const guidedRootId = referenceRootId ?? myRelative?.id ?? null;

  useEffect(() => {
    setDismissedStepIds(new Set());
    setConfirmedRootParentLink(false);
    onPendingRootLinkChange?.(null);
  }, [form.relationship]);

  const guidedStep = useMemo(
    () =>
      buildGuidedFamilyStep({
        relationship: form.relationship,
        relatives,
        rootPersonId: guidedRootId,
        editingRelativeId,
        formLinks: {
          fatherId: form.fatherId,
          motherId: form.motherId,
          spouseId: form.spouseId,
        },
        linkedChildIds,
        dismissedStepIds,
        confirmedRootParentLink,
      }),
    [
      confirmedRootParentLink,
      dismissedStepIds,
      editingRelativeId,
      form.fatherId,
      form.motherId,
      form.relationship,
      form.spouseId,
      guidedRootId,
      linkedChildIds,
      relatives,
    ],
  );

  const applyLinkPatch = (patch: Partial<CreateRelativeInput>) => {
    if (onPatch) {
      onPatch(patch);
      return;
    }

    if (patch.fatherId !== undefined) {
      onChange('fatherId', patch.fatherId);
    }

    if (patch.motherId !== undefined) {
      onChange('motherId', patch.motherId);
    }

    if (patch.spouseId !== undefined) {
      onChange('spouseId', patch.spouseId);
    }
  };

  const handleGuidedPrimary = (action: GuidedLinkAction) => {
    if (action.type === 'patch_form') {
      applyLinkPatch(action.patch);
      if (guidedStep) {
        setDismissedStepIds((current) => new Set(current).add(guidedStep.id));
      }
      return;
    }

    if (action.type === 'confirm_root_parent_link') {
      setConfirmedRootParentLink(true);
      onPendingRootLinkChange?.(resolvePendingRootLinkPatch(action));
      if (guidedStep) {
        setDismissedStepIds((current) => new Set(current).add(guidedStep.id));
      }
      return;
    }

    if (action.type === 'navigate_add_child') {
      router.push({
        pathname: '/add-relative',
        params: action.params,
      });
      if (guidedStep) {
        setDismissedStepIds((current) => new Set(current).add(guidedStep.id));
      }
      return;
    }

    if (action.type === 'focus_children_picker' && guidedStep) {
      setDismissedStepIds((current) => new Set(current).add(guidedStep.id));
    }
  };

  const handleGuidedSkip = (stepId: string) => {
    setDismissedStepIds((current) => new Set(current).add(stepId));
  };

  const previewRelative = useMemo((): Relative | null => {
    if (editingRelativeId) {
      return relatives.find((relative) => relative.id === editingRelativeId) ?? null;
    }

    return {
      id: 'preview',
      fullName: form.fullName,
      firstName: form.firstName,
      middleName: form.middleName,
      birthSurname: form.birthSurname,
      currentSurname: form.currentSurname,
      displayName: form.displayName ?? form.fullName ?? form.firstName,
      relationship: form.relationship,
      birthday: form.birthday,
      birthdayDay: form.birthdayDay,
      birthdayMonth: form.birthdayMonth,
      birthdayYear: form.birthdayYear,
      birthdayYearUnknown: form.birthdayYearUnknown,
      phone: form.phone ?? '',
      avatarColor: form.avatarColor ?? '#2D6A4F',
      photoUrl: form.photoUrl,
      isDeceased: form.isDeceased ?? false,
      fatherId: form.fatherId ?? undefined,
      motherId: form.motherId ?? undefined,
      spouseId: form.spouseId ?? undefined,
      gender: form.gender,
      maritalStatus: form.maritalStatus,
    };
  }, [editingRelativeId, form, relatives]);

  const relationshipPath = useMemo(() => {
    if (!previewRelative) {
      return null;
    }

    const anchor = anchorPerson ?? myRelative;
    if (!anchor) {
      return null;
    }

    return buildKinshipCardLineMap(anchor, [previewRelative], relatives).get(previewRelative.id) ?? null;
  }, [anchorPerson, myRelative, previewRelative, relatives]);

  const handleBirthdayChange = (
    patch: Pick<
      CreateRelativeInput,
      'birthday' | 'birthdayDay' | 'birthdayMonth' | 'birthdayYear' | 'birthdayYearUnknown'
    >,
  ) => {
    const synced = syncBirthdayFields({
      birthdayDay: patch.birthdayDay ?? form.birthdayDay ?? null,
      birthdayMonth: patch.birthdayMonth ?? form.birthdayMonth ?? null,
      birthdayYear: patch.birthdayYear ?? form.birthdayYear ?? null,
      birthdayYearUnknown: patch.birthdayYearUnknown ?? form.birthdayYearUnknown ?? false,
      birthday: patch.birthday ?? form.birthday ?? '',
    });

    const birthdayPatch: Partial<CreateRelativeInput> = {
      birthdayDay: synced.birthdayDay,
      birthdayMonth: synced.birthdayMonth,
      birthdayYear: synced.birthdayYear,
      birthdayYearUnknown: synced.birthdayYearUnknown,
      birthday: synced.birthday,
    };

    if (onPatch) {
      onPatch(birthdayPatch);
      return;
    }

    onChange('birthdayDay', birthdayPatch.birthdayDay ?? null);
    onChange('birthdayMonth', birthdayPatch.birthdayMonth ?? null);
    onChange('birthdayYear', birthdayPatch.birthdayYear ?? null);
    onChange('birthdayYearUnknown', birthdayPatch.birthdayYearUnknown ?? false);
    onChange('birthday', birthdayPatch.birthday ?? '');
  };

  const showBirthSurname = form.gender === 'female';
  const parentSideSiblingHelper = getParentSideSiblingHelperText(form.relationship);
  const parentSideAutoLabelHelper = isParentSideSiblingRelationship(form.relationship)
    ? getParentSideAutoLabelHelperText()
    : null;

  const handleRuChange = (patch: Partial<RuSelection>) => {
    if (patch.zhuz !== undefined) {
      onChange('zhuz', patch.zhuz);
    }
    if (patch.ru !== undefined) {
      onChange('ru', patch.ru);
    }
    if (patch.tribeBranch !== undefined) {
      onChange('tribeBranch', patch.tribeBranch);
    }
    if (patch.ataLine !== undefined) {
      onChange('ataLine', patch.ataLine);
    }
  };

  return (
    <>
      <Card goldBorder style={styles.sectionCard}>
        <RelativePhotoPicker
          name={
            previewRelative
              ? getRelativeDisplayName(previewRelative)
              : form.firstName || form.fullName || 'A'
          }
          color={form.avatarColor ?? pickAvatarColor(form.firstName || form.fullName || 'A')}
          photoUrl={form.clearPhoto ? undefined : form.photoUrl}
          pendingPhotoUri={form.pendingPhotoUri}
          onPhotoSelected={(uri) => {
            onChange('pendingPhotoUri', uri);
            onChange('clearPhoto', false);
          }}
          onPhotoRemoved={() => {
            onChange('pendingPhotoUri', undefined);
            onChange('photoUrl', undefined);
            onChange('clearPhoto', true);
          }}
        />
      </Card>

      {relationshipPath ? (
        <Card goldBorder style={styles.pathCard}>
          <Text style={styles.sectionLabel}>Туыстық жолы · Relationship path</Text>
          <Text style={styles.pathText}>{relationshipPath}</Text>
        </Card>
      ) : null}

      <Card goldBorder style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Туыстық · Родство</Text>
        <RelationshipSelector
          value={form.relationship}
          error={errors.relationship}
          onChange={(relationship) => onChange('relationship', relationship)}
        />
        {parentSideSiblingHelper ? (
          <HelperHintBanner text={parentSideSiblingHelper} />
        ) : null}
        {parentSideAutoLabelHelper ? (
          <HelperHintBanner text={parentSideAutoLabelHelper} tone="cream" />
        ) : null}
      </Card>

      {guidedStep ? (
        <GuidedLinkingAssistant
          step={guidedStep}
          onPrimary={handleGuidedPrimary}
          onSkip={handleGuidedSkip}
        />
      ) : null}

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Жынысы · Пол</Text>
        <View style={styles.optionRow}>
          {GENDER_OPTIONS.map((option) => {
            const selected = form.gender === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => onChange('gender', option.id)}
                style={[styles.optionChip, selected && styles.optionChipSelected]}>
                <Text style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Аты-жөні · ФИО</Text>
        <FormField
          label="Аты · Имя"
          placeholder="Мысалы: Айгül"
          value={form.firstName}
          onChangeText={(value) => onChange('firstName', value)}
          error={errors.firstName}
          autoCapitalize="words"
        />
        <FormField
          label="Тегі · Фамилия"
          placeholder="Мысалы: Қасымова"
          value={form.fullName}
          onChangeText={(value) => onChange('fullName', value)}
          error={errors.fullName}
          autoCapitalize="words"
        />
        <FormField
          label="Әke adı · Отчество"
          placeholder="Необязательно"
          value={form.middleName ?? ''}
          onChangeText={(value) => onChange('middleName', value)}
          autoCapitalize="words"
        />
      </Card>

      {showBirthSurname ? (
        <FormField
          label="Күйеу тегі · Девичья фамилия"
          placeholder="Необязательно"
          value={form.birthSurname ?? ''}
          onChangeText={(value) => onChange('birthSurname', value)}
          autoCapitalize="words"
          hint="Для әйел · maiden name"
        />
      ) : null}

      <FamilyLinkSections
        form={form}
        errors={errors}
        relatives={relatives}
        editingRelativeId={editingRelativeId}
        referenceRootId={guidedRootId}
        linkedChildIds={linkedChildIds}
        onLinkedChildIdsChange={onLinkedChildIdsChange}
        onChange={onChange}
        onPatch={onPatch}
        onSiblingParentSync={onSiblingParentSync}
        hideSiblingGuidance={Boolean(guidedStep?.kind === 'sibling' || guidedStep?.kind === 'info')}
      />

      <Card style={styles.sectionCard}>
        <DisclosureSection
          title={COGNITIVE_LOAD_COPY.optionalFields}
          subtitle={COGNITIVE_LOAD_COPY.optionalFieldsHint}>
          <Card style={styles.nestedCard}>
            <Text style={styles.sectionLabel}>Неке · Семейное положение</Text>
            <View style={styles.optionRow}>
              {MARITAL_STATUS_OPTIONS.map((option) => {
                const selected = form.maritalStatus === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => onChange('maritalStatus', option.id)}
                    style={[styles.optionChipWide, selected && styles.optionChipSelected]}>
                    <Text
                      style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <FormField
            label="Көрсету аты · Display name"
            placeholder="Как показывать в приложении"
            value={form.displayName ?? ''}
            onChangeText={(value) => onChange('displayName', value)}
            autoCapitalize="words"
            hint="Необязательно · по умолчанию — полное имя"
          />

          <Card goldBorder style={styles.nestedCard}>
            <Text style={styles.sectionLabel}>Шежіре деректері · Shezhire</Text>
            <HelperHintBanner
              icon="🌿"
              text={SECTION_HELPER_TEXT.ruSelection.text}
              subtext={SECTION_HELPER_TEXT.ruSelection.subtext}
              tone="cream"
            />
            <RuPicker
              zhuz={form.zhuz}
              ru={form.ru}
              tribeBranch={form.tribeBranch}
              ataLine={form.ataLine}
              onChange={handleRuChange}
            />
          </Card>

          <Card style={styles.nestedCard}>
            <Text style={styles.sectionLabel}>Туған күн · День рождения</Text>
            <BirthdayPicker
              day={form.birthdayDay}
              month={form.birthdayMonth}
              year={form.birthdayYear}
              yearUnknown={form.birthdayYearUnknown ?? false}
              error={errors.birthday}
              onChange={handleBirthdayChange}
            />
          </Card>

          <Card style={styles.nestedCard}>
            <Text style={styles.sectionLabel}>Байланыс · Контакты</Text>
            <FormField
              label="Телефон · Phone"
              placeholder="+7 777 123 4567"
              value={form.phone ?? ''}
              onChangeText={(value) => onChange('phone', value)}
              error={errors.phone}
              keyboardType="phone-pad"
            />
          </Card>

          <Card style={styles.nestedCard}>
            <View style={styles.switchRow}>
              <View style={styles.switchTextWrap}>
                <Text style={styles.switchLabel}>Марқұм · Умер(ла)</Text>
                <Text style={styles.switchHint}>Еске алу бөлімінде сақталады</Text>
              </View>
              <Switch
                value={form.isDeceased ?? false}
                onValueChange={(value) => onChange('isDeceased', value)}
                trackColor={{ false: Palette.creamDark, true: Palette.greenSoft }}
                thumbColor={form.isDeceased ? Palette.greenDeep : Palette.white}
              />
            </View>
          </Card>
        </DisclosureSection>
      </Card>

      {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    gap: Spacing.md,
  },
  nestedCard: {
    gap: Spacing.md,
  },
  pathCard: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  pathText: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    lineHeight: 22,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionChip: {
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionChipWide: {
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionChipSelected: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.gold,
  },
  optionChipText: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '600',
  },
  optionChipTextSelected: {
    color: Palette.white,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  switchTextWrap: {
    flex: 1,
    gap: 2,
  },
  switchLabel: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  switchHint: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  saveError: {
    ...Typography.bodySmall,
    color: Palette.danger,
    textAlign: 'center',
  },
});
