import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FamilyViewTabs } from '@/components/family/FamilyViewTabs';
import { RelativesListPanel } from '@/components/family/RelativesListPanel';
import { ShezhireTreePanel } from '@/components/family/ShezhireTreePanel';
import { AppHeader } from '@/components/ui/AppHeader';
import { ErrorState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { useRelatives } from '@/hooks/useRelatives';
import { FamilyView, parseFamilyView } from '@/utils/family-view';
import { Palette, Spacing } from '@/constants/theme';

export default function FamilyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { highlightId, view: viewParam } = useLocalSearchParams<{
    highlightId?: string | string[];
    view?: string | string[];
  }>();
  const resolvedHighlightId = Array.isArray(highlightId) ? highlightId[0] : highlightId;
  const [activeView, setActiveView] = useState<FamilyView>(() => parseFamilyView(viewParam));
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const {
    relatives,
    loading,
    error,
    isEmpty,
    invalidateRelatives,
    refetch,
    relativesRevision,
    getRelativeById,
  } = useRelatives();

  useFocusEffect(
    useCallback(() => {
      void invalidateRelatives({ silent: true });
    }, [invalidateRelatives]),
  );

  useEffect(() => {
    setActiveView(parseFamilyView(viewParam));
  }, [viewParam]);

  const handleViewChange = useCallback(
    (nextView: FamilyView) => {
      setActiveView(nextView);
      router.setParams(nextView === 'tree' ? { view: 'tree' } : { view: 'list' });
    },
    [router],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await invalidateRelatives({ silent: true });
    setRefreshing(false);
  }, [invalidateRelatives]);

  const headerSubtitle = useMemo(() => {
    if (loading) {
      return 'Загрузка...';
    }

    if (activeView === 'tree') {
      return `${relatives.length} туыс · отбасы ағашы`;
    }

    return `${relatives.length} из ${relatives.length} · родственников`;
  }, [activeView, loading, relatives]);

  const openAddRelative = useCallback(() => {
    router.push('/add-relative');
  }, [router]);

  return (
    <ScreenShell
      scrollRef={activeView === 'list' ? scrollRef : undefined}
      refreshing={refreshing}
      onRefresh={() => void handleRefresh()}
      header={
        <View style={styles.headerWrap}>
          <AppHeader
            title="Туыстар · Родственники"
            subtitle={headerSubtitle}
            badge={activeView === 'tree' ? '🌳' : '👨‍👩‍👧‍👦'}
            onRefresh={() => void handleRefresh()}
            refreshing={refreshing}
          />
          <FamilyViewTabs value={activeView} onChange={handleViewChange} />
        </View>
      }
      footer={
        !loading && !error ? (
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
            <PrimaryButton
              label="Туыс қосу"
              sublabel="Добавить родственника · Add relative"
              variant="green"
              onPress={openAddRelative}
            />
          </View>
        ) : null
      }
      contentStyle={styles.content}>
      {loading ? (
        <LoadingState
          message={
            activeView === 'tree'
              ? 'Шежіре жүктелуде · Загрузка...'
              : 'Туыстар жүктелуде...'
          }
        />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : activeView === 'list' ? (
        <RelativesListPanel
          relatives={relatives}
          loading={loading}
          error={error}
          isEmpty={isEmpty}
          highlightId={resolvedHighlightId}
          scrollRef={scrollRef}
          onRetry={() => void refetch()}
        />
      ) : (
        <ShezhireTreePanel
          relatives={relatives}
          isEmpty={isEmpty}
          relativesRevision={relativesRevision}
          getRelativeById={getRelativeById}
          refreshing={refreshing}
          onRefresh={() => void handleRefresh()}
        />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    backgroundColor: Palette.cream,
  },
  content: {
    gap: Spacing.lg,
  },
  footer: {
    backgroundColor: Palette.cream,
    borderTopWidth: 1,
    borderTopColor: Palette.creamDark,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
});
