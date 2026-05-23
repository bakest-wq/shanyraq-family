import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { HelperHintBanner } from '@/components/ui/HelperHintBanner';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { GRAPH_INTEGRITY_COPY } from '@/constants/graph-integrity-content';
import { useShezhireHealthCheck } from '@/hooks/useShezhireHealthCheck';
import { useToast } from '@/hooks/useToast';
import type { GraphIntegrityHealthItem } from '@/services/graph-integrity.service';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { findRelativeById } from '@/utils/family-link-picker';
import { useRelativesContext } from '@/providers/RelativesProvider';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

function HealthIssueList({
  items,
  emptyLabel,
}: {
  items: GraphIntegrityHealthItem[];
  emptyLabel: string;
}) {
  const { relatives } = useRelativesContext();

  if (items.length === 0) {
    return <Text style={styles.emptyLine}>{emptyLabel}</Text>;
  }

  return (
    <View style={styles.issueList}>
      {items.map((item) => {
        const person = findRelativeById(relatives, item.relativeId);
        const related = item.relatedId ? findRelativeById(relatives, item.relatedId) : null;

        return (
          <View key={`${item.relativeId}:${item.code}:${item.field ?? ''}:${item.relatedId ?? ''}`} style={styles.issueRow}>
            <Text style={styles.issueName}>
              {person ? getRelativeDisplayName(person) : item.relativeId}
            </Text>
            <Text style={styles.issueMessage}>{item.message}</Text>
            {related ? (
              <Text style={styles.issueMeta}>→ {getRelativeDisplayName(related)}</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export function ShezhireHealthCheckPanel() {
  const { showToast } = useToast();
  const { relatives } = useRelativesContext();
  const { report, repairing, repairCounts, applyRepairs, applyAllSafeRepairs } =
    useShezhireHealthCheck();

  const handleRepair = async (kinds: Parameters<typeof applyRepairs>[0], label: string) => {
    const applied = await applyRepairs(kinds);

    showToast({
      type: applied > 0 ? 'success' : 'error',
      title: applied > 0 ? GRAPH_INTEGRITY_COPY.repairs.applied : label,
      message:
        applied > 0
          ? `${applied} түзету сақталды · Repairs saved`
          : 'Түзету қажет емес · Nothing to repair',
    });
  };

  const isHealthy =
    report.brokenParentLinks.length === 0 &&
    report.brokenSpouseLinks.length === 0 &&
    report.circularRelations.length === 0 &&
    report.invalidChildParentLinks.length === 0 &&
    report.duplicatePeople.length === 0 &&
    report.orphanRelatives.length === 0;

  return (
    <View style={styles.wrap}>
      {isHealthy ? (
        <HelperHintBanner
          text={GRAPH_INTEGRITY_COPY.allClear}
          subtext={GRAPH_INTEGRITY_COPY.allClearHint}
          tone="cream"
        />
      ) : (
        <HelperHintBanner
          text="Деректерде түзету қажет болуы мүмкін"
          subtext="Тек қауіпсіз автоматты түзетулер ұсынылады · Safe automatic repairs only"
        />
      )}

      <Card goldBorder style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{GRAPH_INTEGRITY_COPY.sections.brokenParents}</Text>
        <HealthIssueList
          items={report.brokenParentLinks}
          emptyLabel="Жарамсыз ата-ана сілтемесі жоқ"
        />
        {repairCounts.clearBrokenParents > 0 ? (
          <PrimaryButton
            label={GRAPH_INTEGRITY_COPY.repairs.clearBrokenParents}
            sublabel={`${repairCounts.clearBrokenParents} түзету`}
            variant="gold"
            onPress={
              repairing
                ? undefined
                : () => void handleRepair(['clear_broken_parents'], 'Ата-ана')
            }
          />
        ) : null}
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{GRAPH_INTEGRITY_COPY.sections.brokenSpouses}</Text>
        <HealthIssueList
          items={report.brokenSpouseLinks}
          emptyLabel="Жарамсыз жұбай сілтемесі жоқ"
        />
        {repairCounts.syncSpouses > 0 ? (
          <PrimaryButton
            label={GRAPH_INTEGRITY_COPY.repairs.syncSpouses}
            sublabel={`${repairCounts.syncSpouses} түзету`}
            variant="gold"
            onPress={
              repairing ? undefined : () => void handleRepair(['sync_spouses'], 'Жұбай')
            }
          />
        ) : null}
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{GRAPH_INTEGRITY_COPY.sections.duplicates}</Text>
        {report.duplicatePeople.length === 0 ? (
          <Text style={styles.emptyLine}>Қайталану белгісі жоқ</Text>
        ) : (
          <View style={styles.issueList}>
            {report.duplicatePeople.map((pair) => {
              const left = findRelativeById(relatives, pair.leftId);
              const right = findRelativeById(relatives, pair.rightId);

              return (
                <View key={`${pair.leftId}:${pair.rightId}`} style={styles.issueRow}>
                  <Text style={styles.issueName}>
                    {left ? getRelativeDisplayName(left) : pair.leftId} ·{' '}
                    {right ? getRelativeDisplayName(right) : pair.rightId}
                  </Text>
                  <Text style={styles.issueMessage}>{pair.reason}</Text>
                </View>
              );
            })}
          </View>
        )}
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{GRAPH_INTEGRITY_COPY.sections.circular}</Text>
        <HealthIssueList
          items={report.circularRelations}
          emptyLabel="Шеңберлі ата-ана байланысы жоқ"
        />
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{GRAPH_INTEGRITY_COPY.sections.invalidChildParent}</Text>
        <HealthIssueList
          items={report.invalidChildParentLinks}
          emptyLabel="Қате ата-ана/бala байланысы жоқ"
        />
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{GRAPH_INTEGRITY_COPY.sections.orphans}</Text>
        {report.orphanRelatives.length === 0 ? (
          <Text style={styles.emptyLine}>Барлық туыс ағашқа байланысты</Text>
        ) : (
          <View style={styles.issueList}>
            {report.orphanRelatives.map((relative) => (
              <View key={relative.id} style={styles.issueRow}>
                <Text style={styles.issueName}>{getRelativeDisplayName(relative)}</Text>
                <Text style={styles.issueMessage}>Шежіреде орны анықталмаған</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      {report.hasRepairableIssues ? (
        <PrimaryButton
          label={GRAPH_INTEGRITY_COPY.repairs.runAllSafe}
          sublabel={`${repairCounts.total} қауіпсіз түзету`}
          variant="green"
          onPress={repairing ? undefined : () => void applyAllSafeRepairs().then((applied) => {
            showToast({
              type: applied > 0 ? 'success' : 'error',
              title: applied > 0 ? GRAPH_INTEGRITY_COPY.repairs.applied : GRAPH_INTEGRITY_COPY.allClear,
              message:
                applied > 0
                  ? `${applied} түзету сақталды`
                  : 'Түзету қажет емес',
            });
          })}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.lg,
  },
  sectionCard: {
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '800',
  },
  issueList: {
    gap: Spacing.sm,
  },
  issueRow: {
    gap: 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#ECE6DA',
    backgroundColor: '#FCFBF8',
    padding: Spacing.sm,
  },
  issueName: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  issueMessage: {
    ...Typography.caption,
    color: Palette.textSecondary,
    lineHeight: 18,
  },
  issueMeta: {
    ...Typography.caption,
    color: Palette.textMuted,
  },
  emptyLine: {
    ...Typography.caption,
    color: Palette.textMuted,
    lineHeight: 20,
  },
});
