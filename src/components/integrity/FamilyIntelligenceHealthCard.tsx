import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { QuickActionButton } from '@/components/ui/QuickActionButton';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { HEALTH_CHECK_COPY } from '@/constants/health-check-content';
import { MANAGEMENT_SECTIONS } from '@/constants/app-navigation-content';
import { useAppTheme } from '@/hooks/useElderMode';
import { useFamilyIntelligenceHealthCheck } from '@/hooks/useFamilyIntelligenceHealthCheck';
import { formatHealthCheckEntrySubtitle } from '@/utils/family-intelligence-health-check';
import { APP_ROUTES } from '@/utils/safe-navigation';

type FamilyIntelligenceHealthCardProps = {
  compact?: boolean;
};

export function FamilyIntelligenceHealthCard({ compact = false }: FamilyIntelligenceHealthCardProps) {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { issueCount, isHealthy } = useFamilyIntelligenceHealthCheck();

  const entrySubtitle = formatHealthCheckEntrySubtitle(issueCount);

  return (
    <Card goldBorder={!isHealthy} style={styles.card}>
      <SectionTitle
        title={MANAGEMENT_SECTIONS.health.title}
        subtitle={compact ? entrySubtitle : MANAGEMENT_SECTIONS.health.subtitle}
      />

      {!compact ? (
        <Text style={[styles.statusLine, isHealthy ? styles.statusOk : styles.statusAttention]}>
          {entrySubtitle}
        </Text>
      ) : null}

      <QuickActionButton
        icon="🌿"
        label={HEALTH_CHECK_COPY.title}
        variant={isHealthy ? 'gold' : 'green'}
        onPress={() => router.push(APP_ROUTES.shezhireHealthCheck)}
      />
    </Card>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    card: {
      gap: theme.spacing.md,
    },
    statusLine: {
      ...theme.typography.bodySmall,
      lineHeight: 22,
      textAlign: 'center',
    },
    statusOk: {
      color: theme.palette.greenMid,
      fontWeight: '600',
    },
    statusAttention: {
      color: theme.palette.textSecondary,
      fontWeight: '600',
    },
  });
}
