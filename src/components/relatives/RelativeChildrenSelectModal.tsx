import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { SearchField } from '@/components/ui/SearchField';
import { Relative } from '@/types/relative';
import {
  filterChildLinkCandidates,
  validateChildLinkSelection,
} from '@/utils/family-child-links';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type RelativeChildrenSelectModalProps = {
  visible: boolean;
  candidates: Relative[];
  relatives: Relative[];
  selectedIds: string[];
  parentId?: string;
  onConfirm: (ids: string[]) => void;
  onClose: () => void;
};

export function RelativeChildrenSelectModal({
  visible,
  candidates,
  relatives,
  selectedIds,
  parentId,
  onConfirm,
  onClose,
}: RelativeChildrenSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (visible) {
      setDraftIds(selectedIds);
      setSearchQuery('');
    }
  }, [visible, selectedIds]);

  const filteredCandidates = useMemo(
    () => filterChildLinkCandidates(candidates, searchQuery),
    [candidates, searchQuery],
  );

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const toggleSelection = (childId: string) => {
    const validationError = validateChildLinkSelection(childId, parentId, relatives);
    if (validationError) {
      return;
    }

    setDraftIds((current) =>
      current.includes(childId)
        ? current.filter((id) => id !== childId)
        : [...current, childId],
    );
  };

  const handleConfirm = () => {
    onConfirm(draftIds);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Баланы таңдау · Выбрать ребёнка</Text>
          <Text style={styles.subtitle}>
            Бірнеше баланы таңдауға болады · Можно выбрать несколько
          </Text>

          <SearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Іздеу · Поиск по имени"
          />

          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            {filteredCandidates.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Туыс табылмады</Text>
                <Text style={styles.emptyText}>
                  Іздеу сөзін өзгертіңіз · немесе таңдауға болатын туыс жоқ.
                </Text>
              </View>
            ) : (
              filteredCandidates.map((candidate) => {
                const selected = draftIds.includes(candidate.id);
                const disabled = Boolean(
                  validateChildLinkSelection(candidate.id, parentId, relatives),
                );

                return (
                  <Pressable
                    key={candidate.id}
                    onPress={() => toggleSelection(candidate.id)}
                    disabled={disabled}
                    style={({ pressed }) => [
                      styles.option,
                      selected && styles.optionSelected,
                      disabled && styles.optionDisabled,
                      pressed && !disabled && styles.optionPressed,
                    ]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ selected, disabled }}>
                    <AvatarPlaceholder
                      name={getRelativeDisplayName(candidate)}
                      color={candidate.avatarColor}
                      photoUrl={candidate.photoUrl}
                      size={48}
                    />
                    <View style={styles.optionInfo}>
                      <Text
                        style={[styles.optionName, selected && styles.optionNameSelected]}
                        numberOfLines={2}>
                        {getRelativeDisplayName(candidate)}
                      </Text>
                      <Text
                        style={[styles.optionRole, selected && styles.optionRoleSelected]}
                        numberOfLines={1}>
                        {candidate.relationship}
                      </Text>
                    </View>
                    <Text style={[styles.checkmark, selected && styles.checkmarkSelected]}>
                      {selected ? '✓' : ''}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable onPress={handleConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>
                Сақтау · Сохранить ({draftIds.length})
              </Text>
            </Pressable>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Жабу · Закрыть</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    padding: Spacing.lg,
  },
  card: {
    maxHeight: '88%',
    backgroundColor: Palette.cream,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.card,
  },
  title: {
    ...Typography.title,
    color: Palette.greenDeep,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
  list: {
    maxHeight: 420,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 72,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  optionSelected: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.gold,
  },
  optionDisabled: {
    opacity: 0.45,
  },
  optionPressed: {
    opacity: 0.92,
  },
  optionInfo: {
    flex: 1,
    gap: 2,
  },
  optionName: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  optionNameSelected: {
    color: Palette.white,
  },
  optionRole: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  optionRoleSelected: {
    color: Palette.goldLight,
  },
  checkmark: {
    ...Typography.title,
    color: Palette.greenDeep,
    minWidth: 24,
    textAlign: 'center',
  },
  checkmarkSelected: {
    color: Palette.gold,
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  emptyTitle: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
  footer: {
    gap: Spacing.sm,
  },
  confirmButton: {
    minHeight: 52,
    borderRadius: Radius.md,
    backgroundColor: Palette.greenDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    ...Typography.bodySmall,
    color: Palette.white,
    fontWeight: '700',
  },
  closeButton: {
    minHeight: 52,
    borderRadius: Radius.md,
    backgroundColor: Palette.cream,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
});
