import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { RelativeSiblingSelectModal } from '@/components/relatives/RelativeSiblingSelectModal';
import { Relative } from '@/types/relative';
import { FamilyLinkValues } from '@/utils/family-link-validation';
import {
  buildSiblingLinkCandidates,
  findMatchingSiblingId,
} from '@/utils/family-sibling-links';
import { findRelativeById } from '@/utils/family-link-picker';
import { getRelativeDisplayName } from '@/utils/relative-names';
import {
  buildSiblingRelationshipSync,
  logSiblingRelationshipSync,
} from '@/utils/sibling-relationship-sync';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type RelativeSiblingPickerProps = {
  subjectId?: string;
  subjectLinks: FamilyLinkValues;
  relatives: Relative[];
  selectedSiblingId?: string | null;
  onSubjectLinksPatch: (patch: Partial<FamilyLinkValues>) => void;
  onSiblingParentSync?: (siblingId: string, patch: Partial<FamilyLinkValues>) => void;
};

const EMPTY_LABEL = 'Таңдалмаған · Не выбран';

export function RelativeSiblingPicker({
  subjectId,
  subjectLinks,
  relatives,
  selectedSiblingId,
  onSubjectLinksPatch,
  onSiblingParentSync,
}: RelativeSiblingPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSiblingId, setActiveSiblingId] = useState<string | null>(selectedSiblingId ?? null);

  const candidates = useMemo(
    () => buildSiblingLinkCandidates(relatives, subjectId, subjectLinks),
    [relatives, subjectId, subjectLinks],
  );

  const resolvedSiblingId = useMemo(() => {
    if (activeSiblingId) {
      return activeSiblingId;
    }

    return findMatchingSiblingId(relatives, subjectId, subjectLinks);
  }, [activeSiblingId, relatives, subjectId, subjectLinks]);

  const selectedSibling = useMemo(
    () => findRelativeById(relatives, resolvedSiblingId),
    [relatives, resolvedSiblingId],
  );

  const applySiblingSyncPlan = (siblingId: string, sibling: Relative) => {
    const plan = buildSiblingRelationshipSync(subjectId, subjectLinks, sibling);
    logSiblingRelationshipSync(subjectId, subjectLinks, sibling, plan);

    const applyPatches = () => {
      if (plan.copyToSubject && Object.keys(plan.subjectPatch).length > 0) {
        onSubjectLinksPatch(plan.subjectPatch);
      }

      if (
        plan.copyToSibling &&
        onSiblingParentSync &&
        Object.keys(plan.siblingPatch).length > 0
      ) {
        onSiblingParentSync(siblingId, plan.siblingPatch);
      }
    };

    if (!plan.copyToSubject && !plan.copyToSibling && !plan.removesInvalidChildLink) {
      Alert.alert(
        'Ортақ ата-ана · Shared parents',
        `${getRelativeDisplayName(sibling)} таңдалды. Ата-ана деректері сәйкес.`,
      );
      return;
    }

    if (plan.requiresConfirmation) {
      Alert.alert(plan.confirmationTitle, plan.confirmationMessage, [
        { text: 'Болдырмау', style: 'cancel' },
        {
          text: 'Көшіру · Sync',
          onPress: applyPatches,
        },
      ]);
      return;
    }

    applyPatches();
  };

  const applySiblingSelection = (siblingId: string) => {
    const sibling = findRelativeById(relatives, siblingId);
    if (!sibling) {
      return;
    }

    setActiveSiblingId(siblingId);
    applySiblingSyncPlan(siblingId, sibling);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Бауыр · Брат/сестра</Text>

      <View style={styles.valueCard}>
        <Text
          style={[styles.valueText, !selectedSibling && styles.valueTextEmpty]}
          numberOfLines={2}>
          {selectedSibling ? getRelativeDisplayName(selectedSibling) : EMPTY_LABEL}
        </Text>
        {selectedSibling ? (
          <Text style={styles.valueMeta} numberOfLines={1}>
            {selectedSibling.relationship}
          </Text>
        ) : null}
      </View>

      {(subjectLinks.fatherId || subjectLinks.motherId) && (
        <Text style={styles.linkedParentsHint}>
          Ата-ана:{' '}
          {[subjectLinks.fatherId, subjectLinks.motherId]
            .filter(Boolean)
            .map((id) => {
              const person = findRelativeById(relatives, id);
              return person ? getRelativeDisplayName(person) : null;
            })
            .filter(Boolean)
            .join(' · ') || '—'}
        </Text>
      )}

      <Pressable
        onPress={() => setModalVisible(true)}
        style={({ pressed }) => [styles.selectButton, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Бауыр таңдау · Выбрать брата/сестру">
        <Text style={styles.selectButtonText}>Бауыр таңдау · Выбрать</Text>
      </Pressable>

      <RelativeSiblingSelectModal
        visible={modalVisible}
        candidates={candidates}
        selectedId={resolvedSiblingId}
        onSelect={applySiblingSelection}
        onClose={() => setModalVisible(false)}
      />
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
  valueCard: {
    minHeight: 64,
    backgroundColor: Palette.white,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    gap: 2,
  },
  valueText: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  valueTextEmpty: {
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  valueMeta: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  linkedParentsHint: {
    ...Typography.caption,
    color: Palette.greenMid,
    fontWeight: '600',
  },
  selectButton: {
    minHeight: 52,
    borderRadius: Radius.md,
    backgroundColor: Palette.greenDeep,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  pressed: {
    opacity: 0.9,
  },
  selectButtonText: {
    ...Typography.bodySmall,
    color: Palette.white,
    fontWeight: '700',
    textAlign: 'center',
  },
});
