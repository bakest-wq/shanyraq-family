import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { RelativeLinkPicker } from '@/components/relatives/RelativeLinkPicker';
import { RelativeChildrenPicker } from '@/components/relatives/RelativeChildrenPicker';
import { RelativeSiblingPicker } from '@/components/relatives/RelativeSiblingPicker';
import { SiblingParentInheritanceCard } from '@/components/relatives/SiblingParentInheritanceCard';
import { SuggestedLinksSection } from '@/components/relatives/SuggestedLinksSection';
import { Card } from '@/components/ui/Card';
import { HelperHintBanner } from '@/components/ui/HelperHintBanner';
import { SECTION_HELPER_TEXT, SHEZHIRE_NAME_WARNING } from '@/constants/family-ux-content';
import { CreateRelativeInput, Relative } from '@/types/relative';
import {
  buildFamilyLinkCandidates,
  FamilyLinkValues,
  validateRelativeFamilyLinksFull,
} from '@/utils/family-link-validation';
import {
  EXTENDED_FAMILY_LINK_HELPER,
  resolveFamilyLinkFormLayout,
} from '@/utils/family-link-modes';
import { findSiblingParentTemplates } from '@/utils/parent-link-candidates';
import { isSiblingRelationship } from '@/utils/relationship-presets';
import { shouldSuggestSiblingParentInheritance } from '@/utils/sibling-parent-inheritance';
import { RelativeFormErrors } from '@/utils/validation';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type InheritanceDecision = 'pending' | 'accepted' | 'skipped' | 'change';

type FamilyLinkSectionsProps = {
  form: CreateRelativeInput;
  errors: RelativeFormErrors;
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
  onSiblingParentSync?: (siblingId: string, patch: Partial<FamilyLinkValues>) => void;
};

export function FamilyLinkSections({
  form,
  errors,
  relatives,
  editingRelativeId,
  referenceRootId,
  linkedChildIds = [],
  onLinkedChildIdsChange,
  onChange,
  onPatch,
  onSiblingParentSync,
}: FamilyLinkSectionsProps) {
  const [inheritanceDecision, setInheritanceDecision] = useState<InheritanceDecision | null>(
    null,
  );
  const [autoOpenParentPicker, setAutoOpenParentPicker] = useState<'father' | 'mother' | null>(
    null,
  );
  const previousRelationshipRef = useRef(form.relationship);

  const layout = useMemo(
    () => resolveFamilyLinkFormLayout(form.relationship),
    [form.relationship],
  );

  const linkContext = useMemo(
    () => ({
      fatherId: form.fatherId,
      motherId: form.motherId,
      spouseId: form.spouseId,
    }),
    [form.fatherId, form.motherId, form.spouseId],
  );

  const linkValidation = useMemo(
    () =>
      validateRelativeFamilyLinksFull(form, {
        relativeId: editingRelativeId,
        relatives,
        subjectGender: form.gender,
      }),
    [form, editingRelativeId, relatives],
  );

  const fatherCandidates = useMemo(
    () =>
      buildFamilyLinkCandidates(relatives, 'father', {
        subjectId: editingRelativeId,
        subjectGender: form.gender,
        links: linkContext,
      }),
    [relatives, editingRelativeId, form.gender, linkContext],
  );

  const motherCandidates = useMemo(
    () =>
      buildFamilyLinkCandidates(relatives, 'mother', {
        subjectId: editingRelativeId,
        subjectGender: form.gender,
        links: linkContext,
      }),
    [relatives, editingRelativeId, form.gender, linkContext],
  );

  const spouseCandidates = useMemo(
    () =>
      buildFamilyLinkCandidates(relatives, 'spouse', {
        subjectId: editingRelativeId,
        subjectGender: form.gender,
        links: linkContext,
      }),
    [relatives, editingRelativeId, form.gender, linkContext],
  );

  const siblingParentTemplates = useMemo(
    () => findSiblingParentTemplates(relatives, editingRelativeId),
    [relatives, editingRelativeId],
  );

  const siblingInheritance = useMemo(
    () =>
      shouldSuggestSiblingParentInheritance(form.relationship, {
        relatives,
        editingRelativeId,
        focusedRootId: referenceRootId,
      }, linkContext),
    [form.relationship, relatives, editingRelativeId, referenceRootId, linkContext],
  );

  useEffect(() => {
    const previousRelationship = previousRelationshipRef.current;
    previousRelationshipRef.current = form.relationship;

    if (!isSiblingRelationship(form.relationship)) {
      setInheritanceDecision(null);
      setAutoOpenParentPicker(null);
      return;
    }

    if (previousRelationship !== form.relationship) {
      setInheritanceDecision(siblingInheritance.offer ? 'pending' : null);
      setAutoOpenParentPicker(null);
    }
  }, [form.relationship, siblingInheritance.offer]);

  const showParentPickers = layout.showFatherPicker || layout.showMotherPicker;
  const showInheritanceCard =
    isSiblingRelationship(form.relationship) &&
    inheritanceDecision === 'pending' &&
    siblingInheritance.offer != null;

  const patchLinks = (patch: Partial<FamilyLinkValues>) => {
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

  const applySiblingParents = (fatherId: string | null, motherId: string | null) => {
    patchLinks({ fatherId, motherId });
  };

  const handleAcceptInheritedParents = () => {
    if (!siblingInheritance.offer) {
      return;
    }

    patchLinks({
      fatherId: siblingInheritance.offer.fatherId,
      motherId: siblingInheritance.offer.motherId,
    });
    setInheritanceDecision('accepted');
    setAutoOpenParentPicker(null);
  };

  const handleChangeInheritedParents = () => {
    setInheritanceDecision('change');
    setAutoOpenParentPicker('father');
  };

  const handleSkipInheritedParents = () => {
    setInheritanceDecision('skipped');
    setAutoOpenParentPicker(null);
  };

  const hasFamilyLinks = Boolean(form.fatherId || form.motherId || form.spouseId);

  const handleClearFamilyLinks = () => {
    Alert.alert(
      'Байланыстарды тазарту · Clear family links',
      'Әke, ana және жұбай байланыстары жойылады. Аты-жөні өзгермейді.',
      [
        { text: 'Болдырмау · Cancel', style: 'cancel' },
        {
          text: 'Тазарту · Clear',
          style: 'destructive',
          onPress: () => patchLinks({ fatherId: null, motherId: null, spouseId: null }),
        },
      ],
    );
  };

  if (layout.showExtendedGuide) {
    return (
      <Card goldBorder style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>{layout.sectionTitle}</Text>
        <HelperHintBanner
          icon="🌿"
          text={EXTENDED_FAMILY_LINK_HELPER}
          subtext={layout.sectionSubtitle}
          tone="cream"
        />
      </Card>
    );
  }

  return (
    <>
      <Card goldBorder style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>{layout.sectionTitle}</Text>
        <HelperHintBanner
          icon="🔗"
          text={SECTION_HELPER_TEXT.familyLinks.text}
          subtext={layout.sectionSubtitle}
          tone="cream"
        />
        <HelperHintBanner
          icon="⚠️"
          text={SHEZHIRE_NAME_WARNING}
          subtext="Patronymic and surname are display-only · only explicit links build the tree"
          tone="cream"
        />

        {showParentPickers ? (
          <HelperHintBanner
            icon="👨‍👩‍👧"
            text={SECTION_HELPER_TEXT.parentLinks.text}
            subtext={SECTION_HELPER_TEXT.parentLinks.subtext}
            tone="cream"
          />
        ) : null}

        {isSiblingRelationship(form.relationship) &&
        siblingInheritance.missingReferenceParents ? (
          <HelperHintBanner
            icon="ℹ️"
            text={SECTION_HELPER_TEXT.siblingParentInheritanceMissing.text}
            subtext={SECTION_HELPER_TEXT.siblingParentInheritanceMissing.subtext}
            tone="cream"
          />
        ) : null}

        {showInheritanceCard && siblingInheritance.offer ? (
          <SiblingParentInheritanceCard
            offer={siblingInheritance.offer}
            onAccept={handleAcceptInheritedParents}
            onChange={handleChangeInheritedParents}
            onSkip={handleSkipInheritedParents}
          />
        ) : null}

        {layout.showSiblingPicker ? (
          <RelativeSiblingPicker
            subjectId={editingRelativeId}
            subjectLinks={linkContext}
            relatives={relatives}
            onSubjectLinksPatch={patchLinks}
            onSiblingParentSync={onSiblingParentSync}
          />
        ) : null}

        {(layout.showFatherPicker || layout.showMotherPicker || layout.showSpousePicker) && (
          <View style={styles.linkFields}>
            {layout.showFatherPicker ? (
              <RelativeLinkPicker
                linkType="father"
                selectedId={form.fatherId}
                candidates={fatherCandidates}
                relatives={relatives}
                subjectId={editingRelativeId}
                subjectGender={form.gender}
                links={linkContext}
                siblingParentTemplates={siblingParentTemplates}
                onApplySiblingParents={applySiblingParents}
                autoOpen={autoOpenParentPicker === 'father'}
                onAutoOpenHandled={() => setAutoOpenParentPicker(null)}
                error={errors.fatherId}
                warning={!errors.fatherId ? linkValidation.warnings.fatherId : undefined}
                onSelect={(id) => {
                  onChange('fatherId', id);
                  setInheritanceDecision('accepted');
                }}
              />
            ) : null}

            {layout.showMotherPicker ? (
              <RelativeLinkPicker
                linkType="mother"
                selectedId={form.motherId}
                candidates={motherCandidates}
                relatives={relatives}
                subjectId={editingRelativeId}
                subjectGender={form.gender}
                links={linkContext}
                error={errors.motherId}
                warning={!errors.motherId ? linkValidation.warnings.motherId : undefined}
                onSelect={(id) => {
                  onChange('motherId', id);
                  setInheritanceDecision('accepted');
                }}
              />
            ) : null}

            {layout.showSpousePicker && layout.mode !== 'parent' ? (
              <RelativeLinkPicker
                linkType="spouse"
                selectedId={form.spouseId}
                candidates={spouseCandidates}
                relatives={relatives}
                subjectId={editingRelativeId}
                subjectGender={form.gender}
                links={linkContext}
                error={errors.spouseId}
                warning={!errors.spouseId ? linkValidation.warnings.spouseId : undefined}
                onSelect={(id) => patchLinks({ spouseId: id })}
              />
            ) : null}
          </View>
        )}

        {(editingRelativeId || form.fatherId || form.motherId || form.spouseId) &&
        layout.mode !== 'sibling' ? (
          <SuggestedLinksSection
            subjectId={editingRelativeId}
            draftFatherId={form.fatherId}
            draftMotherId={form.motherId}
            draftSpouseId={form.spouseId}
            limit={2}
          />
        ) : null}

        {editingRelativeId && hasFamilyLinks ? (
          <Pressable
            onPress={handleClearFamilyLinks}
            style={({ pressed }) => [styles.clearLinksButton, pressed && styles.clearLinksPressed]}
            accessibilityRole="button"
            accessibilityLabel="Байланыстарды тазарту · Clear family links">
            <Text style={styles.clearLinksText}>Байланыстарды тазарту · Clear family links</Text>
          </Pressable>
        ) : null}
      </Card>

      {layout.showChildrenPicker && onLinkedChildIdsChange ? (
        <Card goldBorder style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Балалары · Дети</Text>
          <HelperHintBanner
            icon="👶"
            text={SECTION_HELPER_TEXT.childrenLinks.text}
            subtext={SECTION_HELPER_TEXT.childrenLinks.subtext}
            tone="cream"
          />
          <RelativeChildrenPicker
            parentId={editingRelativeId}
            relatives={relatives}
            selectedIds={linkedChildIds}
            onChange={onLinkedChildIdsChange}
          />
        </Card>
      ) : null}

      {layout.showSpousePicker && layout.mode === 'parent' ? (
        <Card goldBorder style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Жұбайы · Супруг(а)</Text>
          <RelativeLinkPicker
            linkType="spouse"
            selectedId={form.spouseId}
            candidates={spouseCandidates}
            relatives={relatives}
            subjectId={editingRelativeId}
            subjectGender={form.gender}
            links={linkContext}
            error={errors.spouseId}
            warning={!errors.spouseId ? linkValidation.warnings.spouseId : undefined}
            onSelect={(id) => patchLinks({ spouseId: id })}
          />
        </Card>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    gap: Spacing.md,
  },
  linkFields: {
    gap: Spacing.lg,
  },
  sectionLabel: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  clearLinksButton: {
    minHeight: 48,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.danger,
    backgroundColor: '#FFF7F4',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  clearLinksPressed: {
    opacity: 0.9,
  },
  clearLinksText: {
    ...Typography.bodySmall,
    color: Palette.danger,
    fontWeight: '700',
    textAlign: 'center',
  },
});
