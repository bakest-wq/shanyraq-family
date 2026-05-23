import { useMemo, useState, useEffect } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { RelativeLinkSelectModal } from '@/components/relatives/RelativeLinkSelectModal';
import { Relative, RelativeGender } from '@/types/relative';
import { FamilyLinkType, findRelativeById, getFamilyLinkFieldLabel } from '@/utils/family-link-picker';
import {
  buildSiblingParentApplyLabel,
  type SiblingParentTemplate,
} from '@/utils/parent-link-candidates';
import {
  FamilyLinkValues,
  ValidateFamilyLinksContext,
  validateFamilyLinkSelection,
} from '@/utils/family-link-validation';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type RelativeLinkPickerProps = {
  linkType: FamilyLinkType;
  selectedId: string | null | undefined;
  candidates: Relative[];
  relatives: Relative[];
  subjectGender?: RelativeGender;
  subjectId?: string;
  links?: FamilyLinkValues;
  siblingParentTemplates?: SiblingParentTemplate[];
  onApplySiblingParents?: (fatherId: string | null, motherId: string | null) => void;
  autoOpen?: boolean;
  onAutoOpenHandled?: () => void;
  error?: string;
  warning?: string;
  onSelect: (id: string | null) => void;
};

const EMPTY_LABEL = 'Таңдалмаған · Не выбран';

export function RelativeLinkPicker({
  linkType,
  selectedId,
  candidates,
  relatives,
  subjectGender,
  subjectId,
  links = {},
  siblingParentTemplates = [],
  onApplySiblingParents,
  autoOpen = false,
  onAutoOpenHandled,
  error,
  warning,
  onSelect,
}: RelativeLinkPickerProps) {
  const label = getFamilyLinkFieldLabel(linkType);
  const [modalVisible, setModalVisible] = useState(false);

  const validationContext = useMemo<ValidateFamilyLinksContext>(
    () => ({
      relativeId: subjectId,
      relatives,
      subjectGender,
    }),
    [relatives, subjectGender, subjectId],
  );

  const selectedRelative = useMemo(
    () => findRelativeById(relatives, selectedId),
    [relatives, selectedId],
  );

  const displayName = selectedRelative
    ? getRelativeDisplayName(selectedRelative)
    : EMPTY_LABEL;

  useEffect(() => {
    if (!autoOpen) {
      return;
    }

    setModalVisible(true);
    onAutoOpenHandled?.();
  }, [autoOpen, onAutoOpenHandled]);

  const clearLabel = linkType === 'spouse' ? 'Жұбайды жою' : 'Тазарту · Очистить';

  const handleSelect = (id: string) => {
    const issue = validateFamilyLinkSelection(linkType, id, validationContext, links);

    if (issue?.blocking) {
      Alert.alert('Қате · Ошибка', issue.message);
      return;
    }

    if (issue && !issue.blocking) {
      Alert.alert('Ескерту · Внимание', issue.message, [
        { text: 'Болдырмау', style: 'cancel' },
        { text: 'Қосу · Выбрать', onPress: () => onSelect(id) },
      ]);
      return;
    }

    onSelect(id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.valueCard,
          error && styles.valueCardError,
          !error && warning && styles.valueCardWarning,
        ]}>
        <Text
          style={[styles.valueText, !selectedRelative && styles.valueTextEmpty]}
          numberOfLines={2}>
          {displayName}
        </Text>
        {selectedRelative ? (
          <Text style={styles.valueMeta} numberOfLines={1}>
            {selectedRelative.relationship}
          </Text>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!error && warning ? <Text style={styles.warningText}>{warning}</Text> : null}

      {linkType === 'father' &&
      siblingParentTemplates.length > 0 &&
      onApplySiblingParents ? (
        <View style={styles.quickActions}>
          {siblingParentTemplates.slice(0, 3).map((template) => (
            <Pressable
              key={template.sibling.id}
              onPress={() =>
                onApplySiblingParents(template.fatherId ?? null, template.motherId ?? null)
              }
              style={({ pressed }) => [styles.quickActionButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={buildSiblingParentApplyLabel(template.sibling)}>
              <Text style={styles.quickActionText}>
                {buildSiblingParentApplyLabel(template.sibling)}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={({ pressed }) => [styles.actionButton, styles.selectButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`${label} · Таңдау`}>
          <Text style={styles.selectButtonText}>Таңдау · Выбрать</Text>
        </Pressable>

        {selectedRelative ? (
          <Pressable
            onPress={() => onSelect(null)}
            style={({ pressed }) => [styles.actionButton, styles.clearButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={clearLabel}>
            <Text style={styles.clearButtonText}>{clearLabel}</Text>
          </Pressable>
        ) : null}
      </View>

      <RelativeLinkSelectModal
        visible={modalVisible}
        linkType={linkType}
        candidates={candidates}
        selectedId={selectedId}
        subjectGender={subjectGender}
        onSelect={handleSelect}
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
  valueCardError: {
    borderColor: Palette.danger,
    backgroundColor: '#FFF7F4',
  },
  valueCardWarning: {
    borderColor: Palette.gold,
    backgroundColor: '#FFF9EB',
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
  errorText: {
    ...Typography.caption,
    color: Palette.danger,
    fontWeight: '600',
    lineHeight: 20,
  },
  warningText: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '600',
    lineHeight: 20,
  },
  quickActions: {
    gap: Spacing.sm,
  },
  quickActionButton: {
    minHeight: 48,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.gold,
    backgroundColor: '#FFF9EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  quickActionText: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '700',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionButton: {
    minHeight: 52,
    minWidth: 148,
    flexGrow: 1,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  selectButton: {
    backgroundColor: Palette.greenDeep,
  },
  clearButton: {
    backgroundColor: Palette.cream,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
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
  clearButtonText: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
});
