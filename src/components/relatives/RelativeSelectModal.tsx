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
import { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type RelativeSelectModalProps = {
  visible: boolean;
  title: string;
  relatives: Relative[];
  selectedId?: string | null;
  excludeId?: string | null;
  onSelect: (relative: Relative) => void;
  onClose: () => void;
};

function filterRelatives(relatives: Relative[], searchQuery: string): Relative[] {
  const query = searchQuery.trim().toLowerCase();

  if (!query) {
    return relatives;
  }

  return relatives.filter((relative) => {
    const haystack = [
      getRelativeDisplayName(relative),
      relative.fullName,
      relative.firstName,
      relative.middleName,
      relative.currentSurname,
      relative.relationship,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function RelativeSelectModal({
  visible,
  title,
  relatives,
  selectedId,
  excludeId,
  onSelect,
  onClose,
}: RelativeSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const candidates = useMemo(() => {
    const base = excludeId
      ? relatives.filter((relative) => relative.id !== excludeId)
      : relatives;

    return filterRelatives(base, searchQuery).sort((a, b) =>
      getRelativeDisplayName(a).localeCompare(getRelativeDisplayName(b), 'ru'),
    );
  }, [excludeId, relatives, searchQuery]);

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const handleSelect = (relative: Relative) => {
    onSelect(relative);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>

          <SearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Іздеу · Поиск по имени"
          />

          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            {candidates.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>{EMPTY_STATE_COPY.pickerNoMatch.title}</Text>
                <Text style={styles.emptyText}>{EMPTY_STATE_COPY.pickerNoMatch.hint}</Text>
              </View>
            ) : (
              candidates.map((candidate) => {
                const selected = selectedId === candidate.id;

                return (
                  <Pressable
                    key={candidate.id}
                    onPress={() => handleSelect(candidate)}
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
