import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ShezhireTreePanel } from '@/components/family/ShezhireTreePanel';
import { AppHeader } from '@/components/ui/AppHeader';
import { ErrorState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { APP_TABS } from '@/constants/app-navigation-content';
import { useRelatives } from '@/hooks/useRelatives';
import { Palette, Spacing } from '@/constants/theme';

export default function ShezhireScreen() {
  const router = useRouter();
  const { focusRootId } = useLocalSearchParams<{
    focusRootId?: string | string[];
  }>();
  const resolvedFocusRootId = Array.isArray(focusRootId) ? focusRootId[0] : focusRootId;
  const [refreshing, setRefreshing] = useState(false);

  const {
    relatives,
    loading,
    error,
    isEmpty,
    invalidateRelatives,
    refetch,
    getRelativeById,
  } = useRelatives();

  useFocusEffect(
    useCallback(() => {
      void invalidateRelatives({ silent: true });
    }, [invalidateRelatives]),
  );

  useEffect(() => {
    if (!resolvedFocusRootId || loading) {
      return;
    }

    const exists = relatives.some((relative) => relative.id === resolvedFocusRootId);
    if (!exists) {
      return;
    }

    router.setParams({ focusRootId: undefined });
  }, [loading, relatives, resolvedFocusRootId, router]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await invalidateRelatives({ silent: true });
    setRefreshing(false);
  }, [invalidateRelatives]);

  const headerSubtitle = useMemo(() => {
    if (loading) {
      return 'Жүктелуде...';
    }

    return APP_TABS.shezhire.subtitle;
  }, [loading]);

  return (
    <ScreenShell
      refreshing={refreshing}
      onRefresh={() => void handleRefresh()}
      header={
        <View style={styles.headerWrap}>
          <AppHeader
            title={APP_TABS.shezhire.title}
            subtitle={headerSubtitle}
            badge="🌳"
            onRefresh={() => void handleRefresh()}
            refreshing={refreshing}
          />
        </View>
      }
      contentStyle={styles.content}>
      {loading ? (
        <LoadingState message="Шежіре жүктелуде..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : (
        <ShezhireTreePanel
          relatives={relatives}
          isEmpty={isEmpty}
          getRelativeById={getRelativeById}
          preferredRootId={resolvedFocusRootId ?? null}
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
});
