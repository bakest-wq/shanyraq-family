import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RelativeChildrenSelectModal } from '@/components/relatives/RelativeChildrenSelectModal';
import { Relative } from '@/types/relative';
import { buildChildLinkCandidates } from '@/utils/family-child-links';
import { findRelativeById } from '@/utils/family-link-picker';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type RelativeChildrenPickerProps = {
  parentId?: string;
  relatives: Relative[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export function RelativeChildrenPicker({
  parentId,
  relatives,
  selectedIds,
  onChange,
}: RelativeChildrenPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const candidates = useMemo(
    () => buildChildLinkCandidates(relatives, parentId),
    [relatives, parentId],
  );

  const selectedChildren = useMemo(
    () =>
      selectedIds
        .map((id) => findRelativeById(relatives, id))
        .filter((relative): relative is Relative => Boolean(relative)),
    [relatives, selectedIds],
  );

  return (
    <View style={styles.container}>
      {selectedChildren.length > 0 ? (
        <View style={styles.childrenList}>
          {selectedChildren.map((child) => (
            <View key={child.id} style={styles.childRow}>
              <Text style={styles.childName}>{getRelativeDisplayName(child)}</Text>
              <Text style={styles.childMeta}>{child.relationship}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>Балалар таңдалмаған · Дети не выбраны</Text>
      )}

      <Pressable
        onPress={() => setModalVisible(true)}
        style={({ pressed }) => [styles.selectButton, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Балаларын таңдау · Выбрать детей">
        <Text style={styles.selectButtonText}>Балаларын таңдау · Выбрать детей</Text>
      </Pressable>

      <RelativeChildrenSelectModal
        visible={modalVisible}
        candidates={candidates}
        relatives={relatives}
        selectedIds={selectedIds}
        parentId={parentId}
        onConfirm={onChange}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  childrenList: {
    gap: Spacing.sm,
  },
  childRow: {
    backgroundColor: Palette.white,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    padding: Spacing.sm,
    gap: 2,
  },
  childName: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  childMeta: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  emptyText: {
    ...Typography.caption,
    color: Palette.textSecondary,
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
