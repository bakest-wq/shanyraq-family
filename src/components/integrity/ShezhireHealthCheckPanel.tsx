import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { HealthCheckSection } from '@/components/integrity/HealthCheckIssueCard';
import { Card } from '@/components/ui/Card';
import { HelperHintBanner } from '@/components/ui/HelperHintBanner';
import {
  HEALTH_CHECK_COPY,
  HEALTH_CHECK_SECTION_ORDER,
} from '@/constants/health-check-content';
import { useFamilyIntelligenceHealthCheck } from '@/hooks/useFamilyIntelligenceHealthCheck';
import { useToast } from '@/hooks/useToast';
import { buildEditRelativeHref } from '@/utils/edit-relative-navigation';
import type { HealthCheckIssue } from '@/utils/health-check-issues';

export function ShezhireHealthCheckPanel() {
  const router = useRouter();
  const { showToast } = useToast();
  const { repairing, sections, issueCount, applyIssueAction } = useFamilyIntelligenceHealthCheck();

  const isHealthy = issueCount === 0;

  const handleIssueAction = (issue: HealthCheckIssue) => {
    void (async () => {
      const outcome = await applyIssueAction(issue.action);

      if (outcome === 'done') {
        showToast({
          type: 'success',
          title:
            issue.action.type === 'sync_spouse'
              ? HEALTH_CHECK_COPY.toast.spouseSynced
              : HEALTH_CHECK_COPY.toast.linkCleared,
        });
        return;
      }

      switch (issue.action.type) {
        case 'connect_parents':
          router.push({
            pathname: '/connect-relative/[id]',
            params: { id: issue.action.relativeId },
          });
          return;
        case 'edit_relative':
        case 'review_duplicate':
          router.push(buildEditRelativeHref(issue.action.relativeId, 'shezhire'));
          return;
        default:
          return;
      }
    })();
  };

  return (
    <View style={styles.wrap}>
      {isHealthy ? (
        <HelperHintBanner
          icon="🌿"
          text={HEALTH_CHECK_COPY.allClear}
          subtext={HEALTH_CHECK_COPY.allClearHint}
          tone="cream"
        />
      ) : (
        <HelperHintBanner
          icon="🌿"
          text={HEALTH_CHECK_COPY.needsAttention}
          subtext={HEALTH_CHECK_COPY.needsAttentionHint}
          tone="cream"
        />
      )}

      {HEALTH_CHECK_SECTION_ORDER.map((sectionKey) => (
        <Card key={sectionKey} style={styles.sectionCard}>
          <HealthCheckSection
            title={HEALTH_CHECK_COPY.sections[sectionKey]}
            emptyLabel={HEALTH_CHECK_COPY.empty[sectionKey]}
            issues={sections[sectionKey]}
            disabled={repairing}
            onAction={handleIssueAction}
          />
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
  sectionCard: {
    gap: 12,
  },
});
