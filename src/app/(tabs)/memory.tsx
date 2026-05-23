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
import { DUA_REMINDER } from '@/data/mockData';
import { useArchive } from '@/hooks/useArchive';
import { useRelatives } from '@/hooks/useRelatives';
import { sortMemoriesNewestFirst } from '@/utils/archive-filters';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function MemoryScreen() {
  const router = useRouter();
  const { deceasedRelatives, loading, error, refetch } = useRelatives();
  const { memories } = useArchive();
  const [refreshing, setRefreshing] = useState(false);
  const isDeceasedEmpty = !loading && !error && deceasedRelatives.length === 0;

  const previewMemories = useMemo(
    () => sortMemoriesNewestFirst(memories).slice(0, 2),
    [memories],
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
        <AppHeader
          title="Еске алу"
          subtitle="Память · Марқұмдар мен отбасы естеліктері"
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
          title="Отбасы хронологиясы"
          subtitle="Семейная хронология · туған күн, оқиғалар"
        />
        <QuickActionButton
          icon="🕰️"
          label="Хронологияны ашу"
          sublabel="Отбасы тарихы осында жиналады 🌿"
          variant="gold"
          onPress={() => router.push('/timeline')}
        />
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Отбасы естеліктері"
          subtitle="Family memories · фото, тарих, насихат"
        />
        {previewMemories.length > 0 ? (
          <View style={styles.list}>
            {previewMemories.map((memory) => (
              <FamilyMemoryCard key={memory.id} memory={memory} compact />
            ))}
          </View>
        ) : (
          <Pressable
            onPress={() => router.push('/family-memories')}
            style={({ pressed }) => [styles.memoryPrompt, pressed && styles.pressed]}>
            <Text style={styles.memoryPromptIcon}>🌿</Text>
            <Text style={styles.memoryPromptTitle}>
              Отбасының естеліктері осында сақталады 🌿
            </Text>
            <Text style={styles.memoryPromptSub}>Естеліктер · Open memories</Text>
          </Pressable>
        )}

        <QuickActionButton
          icon="🌿"
          label="Естеліктерді ашу"
          sublabel="All family memories"
          variant="gold"
          onPress={() => router.push('/family-memories')}
        />
      </View>

      <PrimaryButton
        label="Естелік қосу"
        sublabel="Add memory · Жаңа отбасы естелігі"
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
  memoryPrompt: {
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
