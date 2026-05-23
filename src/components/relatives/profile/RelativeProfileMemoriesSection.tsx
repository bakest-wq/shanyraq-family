import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FamilyMemoryCard } from '@/components/family-memories/FamilyMemoryCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Relative } from '@/types/relative';
import { useArchive } from '@/hooks/useArchive';
import { filterMemoriesByRelative, sortMemoriesNewestFirst } from '@/utils/archive-filters';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

import { RelativeProfileSection } from './RelativeProfileSection';

type RelativeProfileMemoriesSectionProps = {
  relative: Relative;
};

export function RelativeProfileMemoriesSection({ relative }: RelativeProfileMemoriesSectionProps) {
  const router = useRouter();
  const { memories } = useArchive();

  const relatedMemories = useMemo(
    () => sortMemoriesNewestFirst(filterMemoriesByRelative(memories, relative.id)).slice(0, 3),
    [memories, relative.id],
  );

  const handleAddMemory = () => {
    router.push({
      pathname: '/add-memory',
      params: { relativeId: relative.id },
    });
  };

  return (
    <RelativeProfileSection
      title="Естеліктер · Memories"
      subtitle="Бұл туыспен байланысты отбасы естеліктері"
      goldBorder>
      {relatedMemories.length > 0 ? (
        <View style={styles.list}>
          {relatedMemories.map((memory) => (
            <FamilyMemoryCard key={memory.id} memory={memory} compact />
          ))}
        </View>
      ) : (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>🌿</Text>
          <Text style={styles.emptyTitle}>Естелік жоқ</Text>
          <Text style={styles.emptyText}>
            Отбасының естеліктері осында сақталады 🌿
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <PrimaryButton
          label="Естелік қосу"
          sublabel="Add memory · осы туыспен"
          variant="green"
          onPress={handleAddMemory}
        />
        {relatedMemories.length > 0 ? (
          <Pressable
            onPress={() => router.push('/family-memories')}
            style={({ pressed }) => [styles.linkButton, pressed && styles.linkPressed]}>
            <Text style={styles.linkText}>Барлық естеліктер · All memories</Text>
          </Pressable>
        ) : null}
      </View>
    </RelativeProfileSection>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.md,
  },
  emptyWrap: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: Palette.cream,
    borderRadius: Radius.md,
  },
  emptyIcon: {
    fontSize: 28,
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
  actions: {
    gap: Spacing.sm,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  linkPressed: {
    opacity: 0.9,
  },
  linkText: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
  },
});
