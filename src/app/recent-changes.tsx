import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GraphVersionItem } from '@/components/trust/GraphVersionItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { GRAPH_VERSION_COPY } from '@/constants/graph-version-content';
import { useGraphVersions } from '@/hooks/useGraphVersions';
import { useRelatives } from '@/hooks/useRelatives';
import { useSafeGoBack } from '@/hooks/useSafeGoBack';
import { useToast } from '@/hooks/useToast';
import { invalidateKinshipCache } from '@/services/kinship/kinship-cache.service';
import { GRAPH_VERSION_MAX } from '@/types/graph-version';
import { APP_ROUTES } from '@/utils/safe-navigation';
import { confirmGraphRestore } from '@/utils/confirm-action';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function RecentChangesScreen() {
  const goBack = useSafeGoBack(APP_ROUTES.management);
  const { showToast } = useToast();
  const { versions, loading, canRestore, canRestoreVersion, restoreVersion, refresh } =
    useGraphVersions({ limit: GRAPH_VERSION_MAX });
  const { invalidateRelatives } = useRelatives();

  const handleRestore = (versionId: string) => {
    confirmGraphRestore(() => {
      void (async () => {
        try {
          await restoreVersion(versionId);
          invalidateKinshipCache();
          await invalidateRelatives({ silent: true });
          await refresh();
          showToast({
            type: 'success',
            title: GRAPH_VERSION_COPY.restoreSuccess,
          });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : GRAPH_VERSION_COPY.restoreBlocked;
          showToast({ type: 'error', title: message });
        }
      })();
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>← Артқа</Text>
        </Pressable>

        <Text style={styles.title}>{GRAPH_VERSION_COPY.screenTitle}</Text>
        <Text style={styles.subtitle}>{GRAPH_VERSION_COPY.screenSubtitle}</Text>

        {loading ? (
          <LoadingState message="Нұсқалар жүктелуде..." />
        ) : versions.length === 0 ? (
          <EmptyState
            icon="🕊️"
            title={GRAPH_VERSION_COPY.emptyTitle}
            subtitle={GRAPH_VERSION_COPY.emptySubtitle}
          />
        ) : (
          <View style={styles.list}>
            {!canRestore ? (
              <Text style={styles.readOnlyHint}>{GRAPH_VERSION_COPY.readOnlyHint}</Text>
            ) : null}
            {versions.map((entry) => (
              <GraphVersionItem
                key={entry.id}
                entry={entry}
                canRestore={canRestore && canRestoreVersion(entry)}
                onRestore={handleRestore}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.cream,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  backText: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  title: {
    ...Typography.hero,
    color: Palette.greenDeep,
  },
  subtitle: {
    ...Typography.body,
    color: Palette.textSecondary,
  },
  list: {
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  readOnlyHint: {
    ...Typography.bodySmall,
    color: Palette.textMuted,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
});
