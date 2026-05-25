import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { HomeFamilyGreeting } from '@/components/home/HomeFamilyGreeting';
import { HomeFamilyWisdomQuote } from '@/components/home/HomeFamilyWisdomQuote';
import { HomeFamilySummary } from '@/components/home/HomeFamilySummary';
import {
  HomeBirthdaysSection,
  HomeGentleRemindersSection,
  HomeRecentMemoriesSection,
} from '@/components/home/HomeDashboardSections';
import { Card } from '@/components/ui/Card';
import { CalmDisclosure } from '@/components/ui/CalmDisclosure';
import { LoadingState } from '@/components/ui/LoadingState';
import { OnboardingHintsCard } from '@/components/ui/OnboardingHintsCard';
import { QuickActionButton } from '@/components/ui/QuickActionButton';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { ScreenSettingsBar } from '@/components/ui/ScreenSettingsBar';
import { ELDER_MODE_COPY } from '@/constants/elder-mode-content';
import { GENEALOGY_UX_COPY } from '@/constants/genealogy-ux-content';
import { useAppTheme, useElderMode } from '@/hooks/useElderMode';
import { useCalmUx } from '@/hooks/useCalmUx';
import { useArchive } from '@/hooks/useArchive';
import { useFamily } from '@/hooks/useFamily';
import { useRelatives } from '@/hooks/useRelatives';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { familyBackupService } from '@/services/family-backup.service';
import {
  getHomeBirthdayHighlights,
  getHomeFamilySummary,
  getHomeGentleReminders,
  getHomeRecentMemories,
} from '@/utils/home-dashboard';
import { pickDefaultRootId } from '@/utils/focused-family-tree';
import { focusPersonInShezhire } from '@/utils/shezhire-navigation';

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useFamily();
  const { relatives, livingRelatives, deceasedRelatives, loading, error, isEmpty } = useRelatives();
  const { memories } = useArchive();
  const { userName, hasLinkedRelative, myRelativeId } = useUserIdentity();
  const { enabled: elderMode } = useElderMode();
  const theme = useAppTheme();
  const { calm } = useCalmUx();
  const styles = useMemo(() => createStyles(theme, calm), [calm, theme]);
  const [hasBackup, setHasBackup] = useState<boolean | undefined>(undefined);

  const familyId = session?.familyId ?? '';
  const familyName = session?.familyName ?? 'Отбасы';
  const displayName = userName ?? session?.ownerName ?? null;

  useEffect(() => {
    if (!familyId) {
      setHasBackup(undefined);
      return;
    }

    void familyBackupService.getLastBackupMeta(familyId).then((meta) => {
      setHasBackup(Boolean(meta));
    });
  }, [familyId]);

  const birthdayHighlights = useMemo(
    () => getHomeBirthdayHighlights(livingRelatives, { limit: elderMode ? 5 : 3 }),
    [elderMode, livingRelatives],
  );

  const recentMemories = useMemo(
    () => getHomeRecentMemories(memories, elderMode ? 2 : 3),
    [elderMode, memories],
  );

  const familySummary = useMemo(
    () => getHomeFamilySummary(relatives, memories, deceasedRelatives.length),
    [deceasedRelatives.length, memories, relatives],
  );

  const reminders = useMemo(
    () =>
      getHomeGentleReminders({
        birthdayHighlights,
        memories,
        deceasedCount: deceasedRelatives.length,
        hasLinkedIdentity: hasLinkedRelative,
        hasBackup,
        limit: elderMode ? 2 : 3,
      }),
    [
      birthdayHighlights,
      deceasedRelatives.length,
      elderMode,
      hasBackup,
      hasLinkedRelative,
      memories,
    ],
  );

  const shezhireRootId = useMemo(
    () => pickDefaultRootId(relatives, myRelativeId),
    [myRelativeId, relatives],
  );

  const openMyShezhire = () => {
    if (shezhireRootId) {
      focusPersonInShezhire(router, shezhireRootId);
      return;
    }

    router.push('/(tabs)/shezhire');
  };

  return (
    <ScreenShell
      header={<ScreenSettingsBar />}
      contentStyle={styles.content}>
      <HomeFamilyGreeting
        familyName={familyName}
        userName={displayName}
        elderMode={elderMode}
      />
      <HomeFamilyWisdomQuote elderMode={elderMode} />

      {loading ? (
        <LoadingState message="Жүктелуде..." />
      ) : error ? (
        <Text style={styles.calmText}>{error}</Text>
      ) : (
        <>
          <HomeFamilySummary summary={familySummary} />

          {!elderMode && !isEmpty ? (
            <Card style={styles.card}>
              <QuickActionButton
                icon="🌳"
                label={GENEALOGY_UX_COPY.homeMyShezhire.kk}
                sublabel={GENEALOGY_UX_COPY.homeMyShezhireHint.kk}
                variant="green"
                onPress={openMyShezhire}
              />
            </Card>
          ) : null}

          <HomeBirthdaysSection entries={birthdayHighlights} elderMode={elderMode} />

          <HomeGentleRemindersSection reminders={reminders} />

          {!elderMode ? (
            <Card style={styles.card}>
              <CalmDisclosure section="homeMore">
                <HomeRecentMemoriesSection memories={recentMemories} />
              </CalmDisclosure>
            </Card>
          ) : null}

          {elderMode ? (
            <Card style={styles.card}>
              <QuickActionButton
                icon="🌳"
                label={ELDER_MODE_COPY.homeShezhireAction}
                sublabel={ELDER_MODE_COPY.homeShezhireHint}
                variant="green"
                onPress={openMyShezhire}
              />
              <QuickActionButton
                icon="👨‍👩‍👧‍👦"
                label="Туыстар"
                variant="gold"
                onPress={() => router.push('/(tabs)/relatives')}
              />
            </Card>
          ) : isEmpty ? (
            <OnboardingHintsCard />
          ) : null}
        </>
      )}
    </ScreenShell>
  );
}

function createStyles(
  theme: ReturnType<typeof useAppTheme>,
  calm: ReturnType<typeof useCalmUx>['calm'],
) {
  return StyleSheet.create({
    content: {
      gap: calm.screenGap,
      paddingTop: theme.spacing.sm,
    },
    calmText: {
      ...theme.typography.body,
      color: theme.palette.textSecondary,
      lineHeight: 26,
    },
    card: {
      gap: theme.spacing.md,
    },
  });
}
