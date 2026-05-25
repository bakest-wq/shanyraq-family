import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EditHistoryItem } from '@/components/trust/EditHistoryItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { EDIT_HISTORY_COPY } from '@/constants/edit-history-content';
import { useEditHistory } from '@/hooks/useEditHistory';
import { useSafeGoBack } from '@/hooks/useSafeGoBack';
import { APP_ROUTES } from '@/utils/safe-navigation';
import { useRelatives } from '@/hooks/useRelatives';
import { useArchive } from '@/hooks/useArchive';
import { useToast } from '@/hooks/useToast';
import { confirmRestore } from '@/utils/confirm-action';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function EditHistoryScreen() {
  const router = useRouter();
  const goBack = useSafeGoBack(APP_ROUTES.management);
  const { showToast } = useToast();
  const { events, loading, canRestore, canRestoreEvent, restoreEvent, refresh } =
    useEditHistory({ limit: 100 });
  const { invalidateRelatives } = useRelatives();
  const { refetch: refetchArchive } = useArchive();

  const handleRestore = (eventId: string) => {
    confirmRestore(() => {
      void (async () => {
        try {
          await restoreEvent(eventId);
          await invalidateRelatives({ silent: true });
          await refetchArchive({ silent: true });
          await refresh();
          showToast({
            type: 'success',
            title: EDIT_HISTORY_COPY.restoreSuccess,
          });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : EDIT_HISTORY_COPY.restoreBlocked;
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

        <Text style={styles.title}>{EDIT_HISTORY_COPY.screenTitle}</Text>
        <Text style={styles.subtitle}>{EDIT_HISTORY_COPY.screenSubtitle}</Text>

        {loading ? (
          <LoadingState message="Тарих жүктелуде..." />
        ) : events.length === 0 ? (
          <EmptyState
            icon="📜"
            title={EDIT_HISTORY_COPY.emptyTitle}
            subtitle={EDIT_HISTORY_COPY.emptySubtitle}
          />
        ) : (
          <View style={styles.list}>
            {!canRestore ? (
              <Text style={styles.readOnlyHint}>
                Тарихты көруге болады. Қалпына келтіру — отбасы иесіне ғана.
              </Text>
            ) : null}
            {events.map((event) => (
              <EditHistoryItem
                key={event.id}
                event={event}
                canRestore={canRestore && canRestoreEvent(event)}
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
