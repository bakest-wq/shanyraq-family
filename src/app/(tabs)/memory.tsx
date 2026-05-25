import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FamilyMemoryCard } from '@/components/family-memories/FamilyMemoryCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { DeceasedCard, DuaBanner } from '@/components/ui/MemoryCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { QuickActionButton } from '@/components/ui/QuickActionButton';
import { RelativesDataView } from '@/components/ui/RelativesDataView';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { APP_TABS, MEMORIES_SECTIONS } from '@/constants/app-navigation-content';
import { EMPTY_STATE_COPY } from '@/constants/empty-state-content';
import { FAMILY_MEMORIES_COPY } from '@/constants/family-memories-content';
import { DUA_REMINDER } from '@/data/mockData';
import { useArchive } from '@/hooks/useArchive';
import { useRelatives } from '@/hooks/useRelatives';
import { type MemoryType } from '@/types/archive';
import { filterMemoriesByCategory, sortMemoriesNewestFirst } from '@/utils/archive-filters';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function MemoriesScreen() {
  const router = useRouter();
  const { deceasedRelatives, loading, error, refetch } = useRelatives();
  const { memories } = useArchive();
  const [refreshing, setRefreshing] = useState(false);
  const isDeceasedEmpty = !loading && !error && deceasedRelatives.length === 0;

  const recentMemories = useMemo(() => sortMemoriesNewestFirst(memories).slice(0, 3), [memories]);

  const photoCount = useMemo(
    () => filterMemoriesByCategory(memories, 'photo').length,
    [memories],
  );
  const storyCount = useMemo(
    () => filterMemoriesByCategory(memories, 'story').length,
    [memories],
  );
  const noteCount = useMemo(
    () => filterMemoriesByCategory(memories, 'note').length,
    [memories],
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch({ silent: true });
    setRefreshing(false);
  };

  const openMemories = (type?: MemoryType) => {
    router.push(type ? { pathname: '/family-memories', params: { type } } : '/family-memories');
  };

  return (
    <ScreenShell
      refreshing={refreshing}
      onRefresh={() => void handleRefresh()}
      header={
        <AppHeader
          title={APP_TABS.memories.title}
          subtitle={FAMILY_MEMORIES_COPY.screenSubtitle}
          badge="📚"
        />
      }
      contentStyle={styles.content}>
      <SectionTitle
        title={MEMORIES_SECTIONS.archive.title}
        subtitle={MEMORIES_SECTIONS.archive.subtitle}
      />

      <View style={styles.categoryGrid}>
        <Pressable
          onPress={() => openMemories('photo')}
          style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}>
          <Text style={styles.categoryIcon}>📷</Text>
          <Text style={styles.categoryTitle}>{MEMORIES_SECTIONS.photos.title}</Text>
          <Text style={styles.categoryMeta}>{photoCount} сурет</Text>
        </Pressable>
        <Pressable
          onPress={() => openMemories('story')}
          style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}>
          <Text style={styles.categoryIcon}>📖</Text>
          <Text style={styles.categoryTitle}>{MEMORIES_SECTIONS.stories.title}</Text>
          <Text style={styles.categoryMeta}>{storyCount} естелік</Text>
        </Pressable>
        <Pressable
          onPress={() => openMemories('note')}
          style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}>
          <Text style={styles.categoryIcon}>🌿</Text>
          <Text style={styles.categoryTitle}>{MEMORIES_SECTIONS.notes.title}</Text>
          <Text style={styles.categoryMeta}>{noteCount} жазба</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title={FAMILY_MEMORIES_COPY.recentTitle}
          subtitle={FAMILY_MEMORIES_COPY.recentHint}
        />
        {recentMemories.length > 0 ? (
          <View style={styles.list}>
            {recentMemories.map((memory) => (
              <FamilyMemoryCard key={memory.id} memory={memory} compact />
            ))}
          </View>
        ) : (
          <Pressable
            onPress={() => openMemories()}
            style={({ pressed }) => [styles.memoryPrompt, pressed && styles.pressed]}>
            <Text style={styles.memoryPromptIcon}>🌿</Text>
            <Text style={styles.memoryPromptTitle}>{FAMILY_MEMORIES_COPY.emptyPromptTitle}</Text>
            <Text style={styles.memoryPromptSub}>{FAMILY_MEMORIES_COPY.emptyPromptHint}</Text>
          </Pressable>
        )}
        <QuickActionButton
          icon="📚"
          label={FAMILY_MEMORIES_COPY.seeAll}
          variant="gold"
          onPress={() => openMemories()}
        />
      </View>

      <View style={styles.section}>
        <SectionTitle
          title={MEMORIES_SECTIONS.memorial.title}
          subtitle={MEMORIES_SECTIONS.memorial.subtitle}
        />
        <DuaBanner text={DUA_REMINDER} />
        <RelativesDataView
          loading={loading}
          error={error}
          isEmpty={isDeceasedEmpty}
          loadingMessage="Естеліктер жүктелуде..."
          emptyIcon="🕊️"
          emptyTitle={EMPTY_STATE_COPY.memorial.title}
          emptySubtitle={EMPTY_STATE_COPY.memorial.hint}
          onRetry={() => void refetch()}
          contentStyle={styles.list}>
          {deceasedRelatives.map((relative) => (
            <DeceasedCard key={relative.id} relative={relative} />
          ))}
        </RelativesDataView>
      </View>

      <PrimaryButton
        label={FAMILY_MEMORIES_COPY.profileAdd}
        sublabel={FAMILY_MEMORIES_COPY.screenSubtitle}
        variant="green"
        onPress={() => router.push('/add-memory')}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.xl,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryCard: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 100,
    backgroundColor: Palette.white,
    borderRadius: 18,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryTitle: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  categoryMeta: {
    ...Typography.caption,
    color: Palette.textMuted,
    textAlign: 'center',
  },
  section: {
    gap: Spacing.md,
  },
  list: {
    gap: Spacing.md,
  },
  memoryPrompt: {
    backgroundColor: Palette.white,
    borderRadius: 20,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pressed: {
    opacity: 0.92,
  },
  memoryPromptIcon: {
    fontSize: 32,
  },
  memoryPromptTitle: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  memoryPromptSub: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
  },
});
