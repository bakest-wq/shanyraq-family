import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ArchiveCategoryChips } from '@/components/archive/ArchiveCategoryChips';
import { ArchiveMemoryCard } from '@/components/archive/ArchiveMemoryCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useArchive } from '@/hooks/useArchive';
import { ARCHIVE_CATEGORY_FILTERS, ArchiveCategoryFilter } from '@/types/archive';
import { filterMemoriesByCategory } from '@/utils/archive-filters';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function ArchiveScreen() {
  const router = useRouter();
  const { memories, loading, error, isEmpty, refetch } = useArchive();
  const [category, setCategory] = useState<ArchiveCategoryFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredMemories = useMemo(
    () => filterMemoriesByCategory(memories, category),
    [memories, category],
  );

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
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Артқа</Text>
          </Pressable>
          <AppHeader
            title="Отбасы архиві"
            subtitle="Семейный архив · фото и истории"
            badge="📚"
          />
        </>
      }
      contentStyle={styles.content}>
      <ArchiveCategoryChips
        options={ARCHIVE_CATEGORY_FILTERS}
        value={category}
        onChange={setCategory}
      />

      {loading ? (
        <LoadingState message="Архив жүктелуде..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : isEmpty ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="📚"
            title="Здесь будут храниться семейные воспоминания."
            subtitle="Отбасы естеліктері · Фото, истории, насихат"
            actionLabel="Добавить историю"
            onAction={() => router.push('/add-memory')}
          />
        </View>
      ) : filteredMemories.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="🔍"
            title="В этой категории пока пусто"
            subtitle="Выберите другую категорию или добавьте новую историю"
            actionLabel="Добавить историю"
            onAction={() => router.push('/add-memory')}
          />
        </View>
      ) : (
        <View style={styles.section}>
          <SectionTitle
            title="Естеліктер"
            subtitle={`${filteredMemories.length} записей · воспоминания семьи`}
          />
          <View style={styles.list}>
            {filteredMemories.map((memory) => (
              <ArchiveMemoryCard key={memory.id} memory={memory} />
            ))}
          </View>
        </View>
      )}

      {!loading && !error ? (
        <PrimaryButton
          label="Добавить историю"
          sublabel="Тарих қосу · Новая семейная запись"
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
