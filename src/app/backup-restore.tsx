import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { DetailField } from '@/components/ui/DetailField';
import { DisclosureSection } from '@/components/ui/motion/DisclosureSection';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { QuickActionButton } from '@/components/ui/QuickActionButton';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { COGNITIVE_LOAD_COPY } from '@/constants/cognitive-load-content';
import {
  FAMILY_BACKUP_COPY,
  restoreDoneHint,
} from '@/constants/family-backup-content';
import { useArchive } from '@/hooks/useArchive';
import { useFamily } from '@/hooks/useFamily';
import { useFamilyPermissions } from '@/hooks/useFamilyPermissions';
import { useRelatives } from '@/hooks/useRelatives';
import { useSafeGoBack } from '@/hooks/useSafeGoBack';
import { APP_ROUTES } from '@/utils/safe-navigation';
import { familyBackupService } from '@/services/family-backup.service';
import type { LocalBackupMeta } from '@/types/family-backup';
import { formatBackupDate } from '@/utils/family-backup-format';
import { Palette, Spacing, Typography } from '@/constants/theme';

type BackupAction = 'json' | 'pdf' | 'manual' | 'restore' | null;

export default function BackupRestoreScreen() {
  const router = useRouter();
  const goBack = useSafeGoBack(APP_ROUTES.management);
  const { session } = useFamily();
  const { canEdit } = useFamilyPermissions();
  const { refetch: refetchRelatives } = useRelatives();
  const { refetch: refetchArchive } = useArchive();
  const [lastBackup, setLastBackup] = useState<LocalBackupMeta | null>(null);
  const [busyAction, setBusyAction] = useState<BackupAction>(null);

  const familyId = session?.familyId ?? '';
  const familyName = session?.familyName ?? 'Отбасы';

  const refreshMeta = useCallback(async () => {
    if (!familyId) {
      setLastBackup(null);
      return;
    }

    const meta = await familyBackupService.getLastBackupMeta(familyId);
    setLastBackup(meta);
  }, [familyId]);

  useEffect(() => {
    void refreshMeta();
  }, [refreshMeta]);

  const runAction = async (action: BackupAction, task: () => Promise<void>) => {
    if (!familyId) {
      Alert.alert('Қате', 'Отбасы таңдалмаған');
      return;
    }

    setBusyAction(action);
    try {
      await task();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Бір нәрсе дұрыс болмады';
      Alert.alert('Қате', message);
    } finally {
      setBusyAction(null);
    }
  };

  const handleExportJson = () => {
    void runAction('json', async () => {
      await familyBackupService.exportJson(familyId, familyName);
      Alert.alert(FAMILY_BACKUP_COPY.exportDone, FAMILY_BACKUP_COPY.exportDoneHint);
    });
  };

  const handleExportPdf = () => {
    void runAction('pdf', async () => {
      await familyBackupService.exportPdf(familyId, familyName);
      Alert.alert(FAMILY_BACKUP_COPY.exportDone, FAMILY_BACKUP_COPY.exportDoneHint);
    });
  };

  const handleManualBackup = () => {
    void runAction('manual', async () => {
      const meta = await familyBackupService.saveManualBackup(familyId, familyName);
      setLastBackup(meta);
      Alert.alert(FAMILY_BACKUP_COPY.manualDone, FAMILY_BACKUP_COPY.manualDoneHint);
    });
  };

  const performRestore = (bundle: Awaited<ReturnType<typeof familyBackupService.pickBackupFile>>) => {
    if (!bundle) {
      return;
    }

    void runAction('restore', async () => {
      const result = await familyBackupService.restoreBackup(familyId, bundle);
      await Promise.all([refetchRelatives({ silent: true }), refetchArchive({ silent: true })]);
      await refreshMeta();
      Alert.alert(
        FAMILY_BACKUP_COPY.restoreDone,
        restoreDoneHint(result.relativesRestored, result.memoriesRestored),
      );
    });
  };

  const handleRestore = () => {
    if (!canEdit) {
      Alert.alert(FAMILY_BACKUP_COPY.restore, FAMILY_BACKUP_COPY.restoreOwnerOnly);
      return;
    }

    Alert.alert(
      FAMILY_BACKUP_COPY.restoreConfirmTitle,
      FAMILY_BACKUP_COPY.restoreConfirmHint,
      [
        { text: FAMILY_BACKUP_COPY.cancelAction, style: 'cancel' },
        {
          text: FAMILY_BACKUP_COPY.restoreAction,
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                const bundle = await familyBackupService.pickBackupFile();
                if (!bundle) {
                  return;
                }

                performRestore(bundle);
              } catch (error) {
                const message = error instanceof Error ? error.message : 'Файл оқылмады';
                Alert.alert('Қате', message);
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>← Артқа</Text>
        </Pressable>

        <Text style={styles.title}>{FAMILY_BACKUP_COPY.screenTitle}</Text>
        <Text style={styles.subtitle}>{FAMILY_BACKUP_COPY.screenSubtitle}</Text>

        <Card goldBorder style={styles.card}>
          <SectionTitle
            title={FAMILY_BACKUP_COPY.reassuranceTitle}
            subtitle={FAMILY_BACKUP_COPY.reassuranceHint}
          />
          <DetailField
            label={FAMILY_BACKUP_COPY.lastBackup}
            value={
              lastBackup
                ? `${formatBackupDate(lastBackup.exportedAt)} · ${lastBackup.relativeCount} туыс`
                : FAMILY_BACKUP_COPY.noBackupYet
            }
          />
          <PrimaryButton
            label={
              busyAction === 'manual' ? FAMILY_BACKUP_COPY.working : FAMILY_BACKUP_COPY.manualBackup
            }
            variant="green"
            onPress={busyAction ? undefined : handleManualBackup}
          />
        </Card>

        <Card style={styles.card}>
          <DisclosureSection
            title={COGNITIVE_LOAD_COPY.exportSection}
            subtitle={COGNITIVE_LOAD_COPY.exportSectionHint}>
            <QuickActionButton
              icon="📄"
              label={FAMILY_BACKUP_COPY.exportJson}
              variant="gold"
              onPress={busyAction ? undefined : handleExportJson}
            />
            <QuickActionButton
              icon="📕"
              label={FAMILY_BACKUP_COPY.exportPdf}
              variant="gold"
              onPress={busyAction ? undefined : handleExportPdf}
            />
          </DisclosureSection>
        </Card>

        <Card style={styles.card}>
          <SectionTitle title="Қалпына келтіру" subtitle={FAMILY_BACKUP_COPY.restoreHint} />
          {!canEdit ? (
            <Text style={styles.ownerHint}>{FAMILY_BACKUP_COPY.restoreOwnerOnly}</Text>
          ) : null}
          <PrimaryButton
            label={
              busyAction === 'restore'
                ? FAMILY_BACKUP_COPY.working
                : FAMILY_BACKUP_COPY.restore
            }
            variant="gold"
            onPress={busyAction ? undefined : handleRestore}
          />
        </Card>
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  backText: {
    ...Typography.body,
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
    lineHeight: 24,
  },
  card: {
    gap: Spacing.md,
  },
  ownerHint: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    lineHeight: 22,
  },
});
