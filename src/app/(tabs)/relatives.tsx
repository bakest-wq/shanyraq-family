import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RelativesListPanel } from '@/components/family/RelativesListPanel';
import { AppHeader } from '@/components/ui/AppHeader';
import { ErrorState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { APP_TABS } from '@/constants/app-navigation-content';
import { useRelatives } from '@/hooks/useRelatives';
import { Palette, Spacing } from '@/constants/theme';

export default function RelativesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { highlightId } = useLocalSearchParams<{ highlightId?: string | string[] }>();
  const resolvedHighlightId = Array.isArray(highlightId) ? highlightId[0] : highlightId;
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const {
    relatives,
    loading,
    error,
    isEmpty,
    invalidateRelatives,
    refetch,
  } = useRelatives();

  useFocusEffect(
    useCallback(() => {
      void invalidateRelatives({ silent: true });
    }, [invalidateRelatives]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await invalidateRelatives({ silent: true });
    setRefreshing(false);
  }, [invalidateRelatives]);

  const openAddRelative = useCallback(() => {
    router.push('/add-relative');
  }, [router]);

  return (
    <ScreenShell
      scrollRef={scrollRef}
      refreshing={refreshing}
      onRefresh={() => void handleRefresh()}
      header={
        <AppHeader
          title={APP_TABS.relatives.title}
          subtitle={APP_TABS.relatives.subtitle}
          badge={loading ? '…' : String(relatives.length)}
          onRefresh={() => void handleRefresh()}
          refreshing={refreshing}
        />
      }
      footer={
        !loading && !error ? (
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
            <PrimaryButton
              label="Туыс қосу"
              sublabel="Жаңа тұлға"
              variant="green"
              onPress={openAddRelative}
            />
          </View>
        ) : null
      }
      contentStyle={styles.content}>
      {loading ? (
        <LoadingState message="Туыстар жүктелуде..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : (
        <RelativesListPanel
          relatives={relatives}
          loading={loading}
          error={error}
          isEmpty={isEmpty}
          highlightId={resolvedHighlightId}
          scrollRef={scrollRef}
          onRetry={() => void refetch()}
        />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
