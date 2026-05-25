import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { SearchField } from '@/components/ui/SearchField';
import { EMPTY_STATE_COPY } from '@/constants/empty-state-content';
import type { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type SelectSelfRelativeListProps = {
  relatives: Relative[];
  selectedId?: string | null;
  onSelect: (relative: Relative) => void;
};

function filterRelatives(relatives: Relative[], query: string): Relative[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return relatives;
  }

  return relatives.filter((relative) => {
    const haystack = [
      relative.displayName,
      relative.fullName,
      relative.firstName,
      relative.relationship,
      relative.phone,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function SelectSelfRelativeList({
  relatives,
  selectedId,
  onSelect,
}: SelectSelfRelativeListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const livingRelatives = useMemo(
    () =>
      [...relatives]
        .filter((relative) => !relative.isDeceased)
        .sort((left, right) =>
          getRelativeDisplayName(left).localeCompare(getRelativeDisplayName(right), 'ru'),
        ),
    [relatives],
  );

  const filteredRelatives = useMemo(
    () => filterRelatives(livingRelatives, searchQuery),
    [livingRelatives, searchQuery],
  );

  if (livingRelatives.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>{EMPTY_STATE_COPY.pickerNoRelatives.title}</Text>
        <Text style={styles.emptyText}>{EMPTY_STATE_COPY.pickerNoRelatives.hint}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <SearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Іздеу · Search relatives"
      />

      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {filteredRelatives.length === 0 ? (
          <Text style={styles.emptyText}>{EMPTY_STATE_COPY.searchNoMatch.title}</Text>
        ) : (
          filteredRelatives.map((relative) => {
            const isSelected = selectedId === relative.id;
            const displayName = getRelativeDisplayName(relative);

            return (
              <Pressable
                key={relative.id}
                onPress={() => onSelect(relative)}
                style={({ pressed }) => [
                  styles.row,
                  isSelected && styles.rowSelected,
                  pressed && styles.rowPressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}>
                <AvatarPlaceholder
                  name={displayName}
                  color={relative.avatarColor}
                  photoUrl={relative.photoUrl}
                  size={48}
                />
                <View style={styles.rowText}>
                  <Text style={styles.rowName} numberOfLines={2}>
                    {displayName}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {relative.relationship}
                  </Text>
                </View>
                {isSelected ? <Text style={styles.checkMark}>✓</Text> : null}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.md,
    flex: 1,
    minHeight: 280,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: '#E8E0D0',
    backgroundColor: Palette.white,
    padding: Spacing.md,
  },
  rowSelected: {
    borderColor: Palette.greenDeep,
    backgroundColor: '#F4FAF6',
  },
  rowPressed: {
    opacity: 0.92,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  rowMeta: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  checkMark: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '800',
  },
  emptyWrap: {
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  emptyTitle: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
