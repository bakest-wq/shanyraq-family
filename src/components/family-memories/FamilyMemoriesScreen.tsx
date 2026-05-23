import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ArchiveCategoryChips } from '@/components/archive/ArchiveCategoryChips';
import { FamilyMemoryCard } from '@/components/family-memories/FamilyMemoryCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useArchive } from '@/hooks/useArchive';
import { MEMORY_TYPE_FILTERS, MemoryTypeFilter } from '@/types/archive';
import { filterMemoriesByCategory, sortMemoriesNewestFirst } from '@/utils/archive-filters';
import { Palette, Spacing, Typography } from '@/constants/theme';

type FamilyMemoriesScreenProps = {
  showBackButton?: boolean;
};

export function FamilyMemoriesScreen({ showBackButton = true }: FamilyMemoriesScreenProps) {
  const router = useRouter();
  const { memories, loading, error, isEmpty, refetch } = useArchive();
  const [typeFilter, setTypeFilter] = useState<MemoryTypeFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredMemories = useMemo(() => {
    const filtered = filterMemoriesByCategory(memories, typeFilter);
    return sortMemoriesNewestFirst(filtered);
  }, [memories, typeFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch({ silent: true });
    setRefreshing(false);
  };

  return (
    <ScreenShell
      refreshing={refreshing}
      onRefresh={() => void handleRefresh()}
      header={
        <>
          {showBackButton ? (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>← Артқа</Text>
            </Pressable>
          ) : null}
          <AppHeader
            title="Отбасы естеліктері"
            subtitle="Family memories · фото, тарих, насихат"
            badge="🌿"
          />
        </>
      }
      contentStyle={styles.content}>
      <ArchiveCategoryChips
        options={MEMORY_TYPE_FILTERS}
        value={typeFilter}
        onChange={setTypeFilter}
      />

      {loading ? (
        <LoadingState message="Естеліктер жүктелуде..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : isEmpty ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="🌿"
            title="Отбасының естеліктері осында сақталады 🌿"
            subtitle="Фото, естеліктер, насихат, дауыс және құжаттар"
            actionLabel="Естелік қосу · Add memory"
            onAction={() => router.push('/add-memory')}
          />
        </View>
      ) : filteredMemories.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="🔍"
            title="Бұл түрде естелік жоқ"
            subtitle="Basqa turdi tanдаńyz · Выберите другой тип"
            actionLabel="Естелік қосу · Add memory"
            onAction={() => router.push('/add-memory')}
          />
        </View>
      ) : (
        <View style={styles.section}>
          <SectionTitle
            title="Естеліктер"
            subtitle={`${filteredMemories.length} жазба · family memories`}
          />
          <View style={styles.list}>
            {filteredMemories.map((memory) => (
              <FamilyMemoryCard key={memory.id} memory={memory} />
            ))}
          </View>
        </View>
      )}

      {!loading && !error ? (
        <PrimaryButton
          label="Естелік қосу"
          sublabel="Add memory · Локально сақталады"
          variant="green"
          onPress={() => router.push('/add-memory')}
        />
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  backText: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  content: {
    gap: Spacing.lg,
  },
  emptyWrap: {
    paddingVertical: Spacing.xl,
  },
  section: {
    gap: Spacing.md,
  },
  list: {
    gap: Spacing.md,
  },
});
