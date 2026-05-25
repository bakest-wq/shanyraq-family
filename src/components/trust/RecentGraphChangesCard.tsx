import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GraphVersionItem } from '@/components/trust/GraphVersionItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { GRAPH_VERSION_COPY } from '@/constants/graph-version-content';
import { useGraphVersions } from '@/hooks/useGraphVersions';
import { Palette, Spacing, Typography } from '@/constants/theme';

const PREVIEW_LIMIT = 3;

export function RecentGraphChangesCard() {
  const router = useRouter();
  const { versions, loading } = useGraphVersions({ limit: PREVIEW_LIMIT });

  return (
    <View style={styles.wrap}>
      <SectionTitle
        title={GRAPH_VERSION_COPY.cardTitle}
        subtitle={GRAPH_VERSION_COPY.cardSubtitle}
      />

      {loading ? (
        <LoadingState message="Жүктелуде..." />
      ) : versions.length === 0 ? (
        <EmptyState
          icon="🕊️"
          title={GRAPH_VERSION_COPY.emptyTitle}
          subtitle={GRAPH_VERSION_COPY.emptySubtitle}
        />
      ) : (
        <View style={styles.list}>
          {versions.map((entry) => (
            <GraphVersionItem key={entry.id} entry={entry} canRestore={false} compact />
          ))}
        </View>
      )}

      <Pressable
        onPress={() => router.push('/recent-changes')}
        hitSlop={8}
        style={styles.linkWrap}>
        <Text style={styles.link}>{GRAPH_VERSION_COPY.viewAll}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.md,
  },
  list: {
    gap: Spacing.sm,
  },
  linkWrap: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  link: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
});
