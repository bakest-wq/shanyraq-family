import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ArchiveMemoryCard } from '@/components/archive/ArchiveMemoryCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { DeceasedCard, DuaBanner } from '@/components/ui/MemoryCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { QuickActionButton } from '@/components/ui/QuickActionButton';
import { RelativesDataView } from '@/components/ui/RelativesDataView';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { DUA_REMINDER } from '@/data/mockData';
import { useArchive } from '@/hooks/useArchive';
import { useRelatives } from '@/hooks/useRelatives';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function MemoryScreen() {
  const router = useRouter();
  const { deceasedRelatives, loading, error, refetch } = useRelatives();
  const { memories } = useArchive();
  const [refreshing, setRefreshing] = useState(false);
  const isDeceasedEmpty = !loading && !error && deceasedRelatives.length === 0;

  const previewMemories = useMemo(() => memories.slice(0, 2), [memories]);

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
        <AppHeader
          title="Еске алу"
          subtitle="Память · Марқұмдар мен отбасы тарихы"
        />
      }>
      <DuaBanner text={DUA_REMINDER} />

      <View style={styles.section}>
        <SectionTitle
          title="Марқұм туыстар"
          subtitle="Ушедшие родственники · дұға оқу"
        />
        <RelativesDataView
          loading={loading}
          error={error}
          isEmpty={isDeceasedEmpty}
          loadingMessage="Еске алу жүктелуде..."
          emptyIcon="🕊️"
          emptyTitle="Марқұм туыстар жоқ"
          emptySubtitle="Отметьте «Марқұм» при добавлении родственника, чтобы сохранить память."
          onRetry={() => void refetch()}
          contentStyle={styles.list}>
          {deceasedRelatives.map((relative) => (
            <DeceasedCard key={relative.id} relative={relative} />
          ))}
        </RelativesDataView>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Отбасы архиві"
          subtitle="Семейный архив · фото, рецепты, истории"
        />
        {previewMemories.length > 0 ? (
          <View style={styles.list}>
            {previewMemories.map((memory) => (
              <ArchiveMemoryCard key={memory.id} memory={memory} compact />
            ))}
          </View>
        ) : (
          <Pressable
            onPress={() => router.push('/archive')}
            style={({ pressed }) => [styles.archivePrompt, pressed && styles.pressed]}>
            <Text style={styles.archivePromptIcon}>📚</Text>
            <Text style={styles.archivePromptTitle}>
              Здесь будут храниться семейные воспоминания.
            </Text>
            <Text style={styles.archivePromptSub}>Открыть архив · Архивті ашу</Text>
          </Pressable>
        )}

        <QuickActionButton
          icon="📚"
          label="Открыть архив"
          sublabel="Барлық естеліктер"
          variant="gold"
          onPress={() => router.push('/archive')}
        />
      </View>

      <PrimaryButton
        label="Добавить историю"
        sublabel="Тарих қосу · Новая семейная запись"
        variant="green"
        onPress={() => router.push('/add-memory')}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  list: {
    gap: Spacing.md,
  },
  archivePrompt: {
    backgroundColor: Palette.white,
    borderRadius: 20,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.creamDark,
  },
  pressed: {
    opacity: 0.92,
  },
  archivePromptIcon: {
    fontSize: 32,
  },
  archivePromptTitle: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  archivePromptSub: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
  },
});
