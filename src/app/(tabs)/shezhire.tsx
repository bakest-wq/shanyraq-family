import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FamilyUnitBlock } from '@/components/shezhire/FamilyUnitBlock';
import { FamilyTreeCard } from '@/components/shezhire/FamilyTreeCard';
import { ShezhireHelperBanner } from '@/components/shezhire/ShezhireHelperBanner';
import { SuggestedLinksSection } from '@/components/relatives/SuggestedLinksSection';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useRelatives } from '@/hooks/useRelatives';
import {
  buildFamilyTree,
  getFamilyUnitAddChildParams,
  isShezhireTreeBuilt,
  type FamilyUnit,
} from '@/utils/family-tree';
import { MaxContentWidth, Palette, Spacing, Typography } from '@/constants/theme';

export default function ShezhireScreen() {
  const router = useRouter();
  const { relatives, loading, error, isEmpty, refetch } = useRelatives();
  const [refreshing, setRefreshing] = useState(false);

  const tree = useMemo(() => buildFamilyTree(relatives), [relatives]);
  const treeBuilt = isShezhireTreeBuilt(tree);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch({ silent: true });
    setRefreshing(false);
  }, [refetch]);

  const openConnect = (id: string) => {
    router.push({
      pathname: '/connect-relative/[id]',
      params: { id },
    });
  };

  const openRelative = (id: string) => {
    router.push({
      pathname: '/relative/[id]',
      params: { id },
    });
  };

  const openAddChild = (unit: FamilyUnit) => {
    const { fatherId, motherId } = getFamilyUnitAddChildParams(unit);

    router.push({
      pathname: '/add-relative',
      params: {
        ...(fatherId ? { fatherId } : {}),
        ...(motherId ? { motherId } : {}),
      },
    });
  };

  return (
    <ScreenShell
      refreshing={refreshing}
      onRefresh={() => void handleRefresh()}
      header={
        <AppHeader
          title="Шежіре"
          subtitle="Отбасы ағашы · Family tree"
          badge="🌳"
        />
      }
      contentStyle={styles.content}>
      {loading ? (
        <LoadingState message="Шежіре жүктелуде · Загрузка..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : isEmpty ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="🌳"
            title="Туыс қосыңыз"
            subtitle="Добавьте родственников, чтобы построить шежіре"
            actionLabel="Туыс қосу · Add relative"
            onAction={() => router.push('/add-relative')}
          />
        </View>
      ) : (
        <View style={styles.main}>
          <ShezhireHelperBanner />

          <PrimaryButton
            label="Туыстықты анықтау"
            sublabel="Relationship · Compare two relatives"
            variant="gold"
            onPress={() => router.push('/relationship')}
          />

          <SuggestedLinksSection limit={4} compact />

          {treeBuilt ? (
            <View style={styles.section}>
              <SectionTitle
                title="Отбасы блоктары"
                subtitle="Family units · жұбай жұбы және балалар"
              />
              <View style={styles.unitsList}>
                {tree.units.map((unit) => (
                  <FamilyUnitBlock
                    key={unit.key}
                    unit={unit}
                    onOpenRelative={openRelative}
                    onAddChild={openAddChild}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.treeEmptyWrap}>
              <Text style={styles.treeEmptyIcon}>🌿</Text>
              <Text style={styles.treeEmptyTitle}>Шежіре әлі құрылмаған</Text>
              <Text style={styles.treeEmptySubtitle}>
                Әke, ana немесе жұбай байланыстарын қосыңыз — отбасы блоктары автоматты түрде құрылады.
              </Text>
              <Text style={styles.treeEmptyHint}>
                Бір отбасы = ата-ана жоғарыда, балалар төменде · No duplicate blocks.
              </Text>
            </View>
          )}

          {tree.unlinked.length > 0 ? (
            <View style={styles.section}>
              <SectionTitle
                title="Байланыссыз туыстар"
                subtitle="Unlinked · әke / ana / жұбай қосу керек"
              />
              <Text style={styles.unlinkedHint}>
                «Байлау» батырмасын басып, ата-ана таңдаңыз · Tap Connect to link parents.
              </Text>
              <View style={styles.unlinkedGrid}>
                {tree.unlinked.map((relative) => (
                  <FamilyTreeCard
                    key={relative.id}
                    relative={relative}
                    gridItem
                    onPress={() => openRelative(relative.id)}
                    onConnect={() => openConnect(relative.id)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <PrimaryButton
            label="Туыс қосу"
            sublabel="Добавить родственника · New relative"
            variant="green"
            onPress={() => router.push('/add-relative')}
          />
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
  },
  main: {
    gap: Spacing.lg,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  emptyWrap: {
    paddingVertical: Spacing.xl,
  },
  section: {
    gap: Spacing.md,
  },
  unitsList: {
    gap: Spacing.lg,
  },
  treeEmptyWrap: {
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Palette.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Palette.goldLight,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  treeEmptyIcon: {
    fontSize: 36,
  },
  treeEmptyTitle: {
    ...Typography.subtitle,
    color: Palette.greenDeep,
    fontWeight: '700',
    textAlign: 'center',
  },
  treeEmptySubtitle: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  treeEmptyHint: {
    ...Typography.caption,
    color: Palette.greenMid,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
  },
  unlinkedHint: {
    ...Typography.caption,
    color: Palette.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  unlinkedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.sm,
    columnGap: Spacing.sm,
  },
});
