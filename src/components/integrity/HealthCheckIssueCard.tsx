import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import type { HealthCheckIssue } from '@/utils/health-check-issues';

type HealthCheckIssueCardProps = {
  issue: HealthCheckIssue;
  disabled?: boolean;
  onAction: (issue: HealthCheckIssue) => void;
};

export function HealthCheckIssueCard({
  issue,
  disabled = false,
  onAction,
}: HealthCheckIssueCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{issue.personName}</Text>
      <Text style={styles.explanation}>{issue.explanation}</Text>
      <Pressable
        onPress={() => onAction(issue)}
        disabled={disabled}
        style={({ pressed }) => [
          styles.actionButton,
          disabled && styles.actionButtonDisabled,
          pressed && !disabled && styles.actionButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={issue.actionLabel}>
        <Text style={styles.actionText}>{issue.actionLabel}</Text>
      </Pressable>
    </View>
  );
}

type HealthCheckSectionProps = {
  title: string;
  emptyLabel: string;
  issues: HealthCheckIssue[];
  disabled?: boolean;
  onAction: (issue: HealthCheckIssue) => void;
};

export function HealthCheckSection({
  title,
  emptyLabel,
  issues,
  disabled = false,
  onAction,
}: HealthCheckSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {issues.length === 0 ? (
        <Text style={styles.emptyLine}>{emptyLabel}</Text>
      ) : (
        <View style={styles.issueList}>
          {issues.map((issue) => (
            <HealthCheckIssueCard
              key={issue.id}
              issue={issue}
              disabled={disabled}
              onAction={onAction}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '800',
  },
  issueList: {
    gap: Spacing.sm,
  },
  card: {
    gap: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#ECE6DA',
    backgroundColor: '#FCFBF8',
    padding: Spacing.md,
  },
  name: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  explanation: {
    ...Typography.caption,
    color: Palette.textSecondary,
    lineHeight: 20,
  },
  actionButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
    minHeight: 40,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.greenDeep,
    backgroundColor: '#F4FAF6',
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.55,
  },
  actionButtonPressed: {
    opacity: 0.92,
  },
  actionText: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  emptyLine: {
    ...Typography.caption,
    color: Palette.textMuted,
    lineHeight: 20,
  },
});
