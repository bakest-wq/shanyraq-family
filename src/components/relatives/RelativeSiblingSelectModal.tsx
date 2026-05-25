import { useMemo, useState } from 'react';
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
import { EMPTY_STATE_COPY } from '@/constants/empty-state-content';
import { filterSiblingLinkCandidates, SiblingCandidate } from '@/utils/family-sibling-links';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type RelativeSiblingSelectModalProps = {
  visible: boolean;
  candidates: SiblingCandidate[];
  selectedId: string | null | undefined;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export function RelativeSiblingSelectModal({
  visible,
  candidates,
  selectedId,
  onSelect,
  onClose,
}: RelativeSiblingSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCandidates = useMemo(
    () => filterSiblingLinkCandidates(candidates, searchQuery),
    [candidates, searchQuery],
  );

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Бауыр таңдау · Выбрать брата/сестру</Text>
          <Text style={styles.subtitle}>
            Ортақ ата-ана бар туысдар алдымен көрсетіледі · Shared parents shown first
          </Text>

          <SearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Іздеу · Поиск по имени"
          />

          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            {filteredCandidates.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>{EMPTY_STATE_COPY.pickerNoMatch.title}</Text>
                <Text style={styles.emptyText}>{EMPTY_STATE_COPY.pickerNoMatch.hint}</Text>
              </View>
            ) : (
              filteredCandidates.map((candidate) => {
                const selected = selectedId === candidate.id;

                return (
                  <Pressable
                    key={candidate.id}
                    onPress={() => handleSelect(candidate.id)}
                    style={({ pressed }) => [
                      styles.option,
                      selected && styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}>
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
                      {candidate.hasSharedParents ? (
                        <Text
                          style={[
                            styles.sharedParentsBadge,
                            selected && styles.sharedParentsBadgeSelected,
                          ]}>
                          Ортақ ата-ана · Shared parents
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Жабу · Закрыть</Text>
          </Pressable>
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
  sharedParentsBadge: {
    ...Typography.caption,
    color: Palette.greenMid,
    fontWeight: '700',
  },
  sharedParentsBadgeSelected: {
    color: Palette.goldLight,
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
  closeButton: {
    minHeight: 52,
    borderRadius: Radius.md,
    backgroundColor: Palette.greenDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    ...Typography.bodySmall,
    color: Palette.white,
    fontWeight: '700',
  },
});
