import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { QuickActionButton } from '@/components/ui/QuickActionButton';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { FAMILY_BACKUP_COPY } from '@/constants/family-backup-content';
import { useFamily } from '@/hooks/useFamily';
import { familyBackupService } from '@/services/family-backup.service';
import type { LocalBackupMeta } from '@/types/family-backup';
import { formatBackupDate } from '@/utils/family-backup-format';
import { Palette, Spacing, Typography } from '@/constants/theme';

type FamilyBackupSettingsCardProps = {
  embedded?: boolean;
};

export function FamilyBackupSettingsCard({ embedded = false }: FamilyBackupSettingsCardProps) {
  const router = useRouter();
  const { session } = useFamily();
  const [lastBackup, setLastBackup] = useState<LocalBackupMeta | null>(null);

  useEffect(() => {
    if (!session?.familyId) {
      setLastBackup(null);
      return;
    }

    void familyBackupService.getLastBackupMeta(session.familyId).then(setLastBackup);
  }, [session?.familyId]);

  const body = (
    <>
      <SectionTitle
        title={FAMILY_BACKUP_COPY.sectionTitle}
        subtitle={FAMILY_BACKUP_COPY.sectionHint}
      />

      <View style={styles.reassurance}>
        <Text style={styles.reassuranceIcon}>🛡️</Text>
        <View style={styles.reassuranceText}>
          <Text style={styles.reassuranceTitle}>{FAMILY_BACKUP_COPY.reassuranceTitle}</Text>
          <Text style={styles.reassuranceHint}>{FAMILY_BACKUP_COPY.reassuranceHint}</Text>
        </View>
      </View>

      <View style={styles.lastBackupBox}>
        <Text style={styles.lastBackupLabel}>{FAMILY_BACKUP_COPY.lastBackup}</Text>
        {lastBackup ? (
          <>
            <Text style={styles.lastBackupValue}>{formatBackupDate(lastBackup.exportedAt)}</Text>
            <Text style={styles.lastBackupMeta}>
              {lastBackup.relativeCount} туыс · {lastBackup.memoryCount} естелік
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.lastBackupEmpty}>{FAMILY_BACKUP_COPY.noBackupYet}</Text>
            <Text style={styles.lastBackupMeta}>{FAMILY_BACKUP_COPY.noBackupHint}</Text>
          </>
        )}
      </View>

      <QuickActionButton
        icon="💾"
        label={FAMILY_BACKUP_COPY.openSettings}
        sublabel={FAMILY_BACKUP_COPY.openSettingsHint}
        variant="green"
        onPress={() => router.push('/backup-restore')}
      />
    </>
  );

  if (embedded) {
    return <View style={styles.embedded}>{body}</View>;
  }

  return <Card goldBorder style={styles.card}>{body}</Card>;
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
  },
  embedded: {
    gap: Spacing.md,
  },
  reassurance: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: Palette.cream,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'flex-start',
  },
  reassuranceIcon: {
    fontSize: 28,
  },
  reassuranceText: {
    flex: 1,
    gap: Spacing.xs,
  },
  reassuranceTitle: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '800',
  },
  reassuranceHint: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    lineHeight: 22,
  },
  lastBackupBox: {
    backgroundColor: Palette.white,
    borderRadius: 16,
    padding: Spacing.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Palette.goldLight,
  },
  lastBackupLabel: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '700',
  },
  lastBackupValue: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  lastBackupEmpty: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  lastBackupMeta: {
    ...Typography.caption,
    color: Palette.greenMid,
    fontWeight: '600',
  },
});
