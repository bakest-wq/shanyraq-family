import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ElderModeSettingsCard } from '@/components/settings/ElderModeSettingsCard';
import { RecentGraphChangesCard } from '@/components/trust/RecentGraphChangesCard';
import { FamilyIntelligenceHealthCard } from '@/components/integrity/FamilyIntelligenceHealthCard';
import { CalmDisclosure } from '@/components/ui/CalmDisclosure';
import { FamilyBackupSettingsCard } from '@/components/settings/FamilyBackupSettingsCard';
import { DevTestFamilyTools } from '@/components/settings/DevTestFamilyTools';
import { SettingsAccessButton } from '@/components/ui/SettingsAccessButton';
import { Card } from '@/components/ui/Card';
import { DetailField } from '@/components/ui/DetailField';
import { DisclosureSection } from '@/components/ui/motion/DisclosureSection';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { QuickActionButton } from '@/components/ui/QuickActionButton';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { APP_TABS, MANAGEMENT_SECTIONS } from '@/constants/app-navigation-content';
import { COGNITIVE_LOAD_COPY } from '@/constants/cognitive-load-content';
import { EDIT_HISTORY_COPY } from '@/constants/edit-history-content';
import { isDevToolsEnabled } from '@/constants/dev-tools';
import { FAMILY_SPACE_COPY } from '@/constants/family-space-content';
import { USER_IDENTITY_COPY } from '@/constants/user-identity-content';
import { useAppTheme, useElderMode } from '@/hooks/useElderMode';
import { useCalmUx } from '@/hooks/useCalmUx';
import { useFamily } from '@/hooks/useFamily';
import { useFamilyPermissions } from '@/hooks/useFamilyPermissions';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import {
  buildFamilyInviteMessage,
  copyTextToClipboard,
  formatInviteCodeDisplay,
  openWhatsAppShare,
} from '@/utils/family-invite';

export default function ManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, leaveFamily } = useFamily();
  const { canEdit } = useFamilyPermissions();
  const { myRelative, hasLinkedRelative } = useUserIdentity();
  const { enabled: elderMode } = useElderMode();
  const theme = useAppTheme();
  const { calm } = useCalmUx();
  const styles = useMemo(() => createStyles(theme, calm), [calm, theme]);
  const [showInviteMessage, setShowInviteMessage] = useState(false);

  const inviteCode = session?.inviteCode ?? '';
  const inviteDisplay = inviteCode ? formatInviteCodeDisplay(inviteCode) : '—';

  const handleCopyCode = async () => {
    if (!inviteCode) {
      Alert.alert('Код жоқ', 'Шақыру коды әлі қолжетімсіз.');
      return;
    }

    await copyTextToClipboard(formatInviteCodeDisplay(inviteCode));
    Alert.alert('Код көшірілді', `${formatInviteCodeDisplay(inviteCode)} — туыстарыңызға жіберуге дайын.`);
  };

  const handleWhatsAppShare = () => {
    if (!session?.familyName || !inviteCode) {
      Alert.alert('Қате', 'Шақыру дайындалмады.');
      return;
    }

    openWhatsAppShare(buildFamilyInviteMessage(session.familyName, inviteCode));
  };

  const handleLeave = () => {
    Alert.alert('Отбасынан шығу', 'Бұл құрылғыдан отбасынан шығасыз ба?', [
      { text: 'Болдырмау', style: 'cancel' },
      {
        text: 'Шығу',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await leaveFamily();
            router.replace('/onboarding');
          })();
        },
      },
    ]);
  };

  const handleSwitchFamily = () => {
    Alert.alert('Отбасын ауыстыру', 'Алдымен шығып, жаңа шақыру кодымен қосыла аласыз.', [
      { text: 'Болдырмау', style: 'cancel' },
      {
        text: 'Шығу және қосылу',
        onPress: () => {
          void (async () => {
            await leaveFamily();
            router.replace('/join-family');
          })();
        },
      },
    ]);
  };

  return (
    <ScreenShell
      header={
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.title}>{APP_TABS.management.title}</Text>
              {!elderMode ? <Text style={styles.subtitle}>{APP_TABS.management.subtitle}</Text> : null}
            </View>
            <SettingsAccessButton />
          </View>
        </View>
      }
      contentStyle={styles.content}>
      <ElderModeSettingsCard />
      <FamilyIntelligenceHealthCard compact={elderMode} />

      <Card goldBorder style={styles.card}>
        <SectionTitle
          title={MANAGEMENT_SECTIONS.family.title}
          subtitle={MANAGEMENT_SECTIONS.family.subtitle}
        />
        <DetailField label="Отбасы атауы" value={session?.familyName ?? '—'} />
        {!elderMode ? (
          <>
            <DetailField label="Сіз" value={session?.ownerName ?? '—'} />
            <DetailField
              label={MANAGEMENT_SECTIONS.permissions.title}
              value={session?.role === 'owner' ? 'Ие' : 'Мүше'}
            />
            <Text style={styles.hint}>
              {canEdit ? FAMILY_SPACE_COPY.ownerCanEditHint : FAMILY_SPACE_COPY.memberReadOnlyHint}
            </Text>
          </>
        ) : null}
      </Card>

      {!elderMode ? (
        <Card goldBorder style={styles.card}>
          <SectionTitle
            title={MANAGEMENT_SECTIONS.invite.title}
            subtitle={MANAGEMENT_SECTIONS.invite.subtitle}
          />
          <View style={styles.inviteBox}>
            <Text style={styles.inviteLabel}>Шақыру коды</Text>
            <Text style={styles.inviteCode}>{inviteDisplay}</Text>
          </View>
          <QuickActionButton
            icon="💬"
            label="WhatsApp арқылы шақыру"
            variant="green"
            onPress={handleWhatsAppShare}
          />
          <Pressable onPress={() => void handleCopyCode()} hitSlop={8} style={styles.textLinkWrap}>
            <Text style={styles.textLink}>{COGNITIVE_LOAD_COPY.copyCode}</Text>
          </Pressable>
          {showInviteMessage && session?.familyName ? (
            <Text style={styles.messagePreview} numberOfLines={6}>
              {buildFamilyInviteMessage(session.familyName, inviteCode)}
            </Text>
          ) : (
            <Pressable
              onPress={() => setShowInviteMessage(true)}
              hitSlop={8}
              style={styles.textLinkWrap}>
              <Text style={styles.textLink}>{COGNITIVE_LOAD_COPY.showInviteMessage}</Text>
            </Pressable>
          )}
        </Card>
      ) : null}

      {!elderMode ? (
        <Card style={styles.card}>
          <CalmDisclosure section="managementCare">
            <RecentGraphChangesCard />
            <FamilyBackupSettingsCard embedded />
            <SectionTitle
              title={MANAGEMENT_SECTIONS.archive.title}
              subtitle={MANAGEMENT_SECTIONS.archive.subtitle}
            />
            <QuickActionButton
              icon="📚"
              label="Естеліктер"
              variant="green"
              onPress={() => router.push('/family-memories')}
            />
            <Pressable onPress={() => router.push('/timeline')} hitSlop={8} style={styles.textLinkWrap}>
              <Text style={styles.textLink}>{COGNITIVE_LOAD_COPY.timelineLink}</Text>
            </Pressable>
          </CalmDisclosure>
        </Card>
      ) : (
        <FamilyBackupSettingsCard />
      )}

      {!elderMode ? (
        <Card style={styles.card}>
          <DisclosureSection
            title={COGNITIVE_LOAD_COPY.moreSection}
            subtitle={COGNITIVE_LOAD_COPY.moreSectionHint}>
            <QuickActionButton
              icon="📜"
              label={EDIT_HISTORY_COPY.viewHistory}
              variant="gold"
              onPress={() => router.push('/edit-history')}
            />
            <View style={styles.identityBlock}>
              <DetailField
                label="Байланыс"
                value={
                  hasLinkedRelative && myRelative
                    ? myRelative.displayName || myRelative.fullName || myRelative.firstName
                    : USER_IDENTITY_COPY.notLinked
                }
              />
              <QuickActionButton
                icon="👤"
                label={USER_IDENTITY_COPY.settingsButton}
                variant="gold"
                onPress={() => router.push('/who-am-i')}
              />
            </View>
            <QuickActionButton
              icon="🔔"
              label="Хабарландыру баптаулары"
              variant="gold"
              onPress={() => router.push('/notification-settings')}
            />
            <Pressable onPress={handleSwitchFamily} hitSlop={8} style={styles.textLinkWrap}>
              <Text style={styles.textLinkMuted}>{COGNITIVE_LOAD_COPY.switchFamily}</Text>
            </Pressable>
          </DisclosureSection>
        </Card>
      ) : null}

      {isDevToolsEnabled && !elderMode ? <DevTestFamilyTools /> : null}

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, theme.spacing.md) }]}>
        <PrimaryButton
          label="Отбасынан шығу"
          sublabel={elderMode ? undefined : 'Бұл құрылғыдан'}
          variant="green"
          onPress={handleLeave}
        />
      </View>
    </ScreenShell>
  );
}

function createStyles(
  theme: ReturnType<typeof useAppTheme>,
  calm: ReturnType<typeof useCalmUx>['calm'],
) {
  return StyleSheet.create({
    header: {
      gap: theme.spacing.xs,
      paddingBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      overflow: 'visible',
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
    },
    headerTitleWrap: {
      flex: 1,
      minWidth: 0,
      gap: theme.spacing.xs,
    },
    title: {
      ...theme.typography.hero,
      color: theme.palette.greenDeep,
      flexShrink: 1,
      flexWrap: 'wrap',
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.palette.textSecondary,
    },
    content: {
      gap: calm.screenGap,
    },
    card: {
      gap: theme.spacing.md,
    },
    hint: {
      ...theme.typography.caption,
      color: theme.palette.textSecondary,
      lineHeight: 22,
    },
    inviteBox: {
      backgroundColor: theme.palette.creamDark,
      borderRadius: 20,
      padding: theme.spacing.lg,
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    inviteLabel: {
      ...theme.typography.caption,
      color: theme.palette.textSecondary,
      fontWeight: '700',
    },
    inviteCode: {
      fontSize: theme.elderMode ? 38 : 34,
      lineHeight: theme.elderMode ? 46 : 42,
      fontWeight: '800',
      color: theme.palette.greenDeep,
      letterSpacing: 3,
    },
    messagePreview: {
      ...theme.typography.bodySmall,
      color: theme.palette.greenMid,
      lineHeight: 24,
      backgroundColor: theme.palette.white,
      borderRadius: 16,
      padding: theme.spacing.md,
    },
    textLinkWrap: {
      alignSelf: 'center',
      paddingVertical: theme.spacing.xs,
    },
    textLink: {
      ...theme.typography.bodySmall,
      color: theme.palette.greenMid,
      fontWeight: '600',
      textAlign: 'center',
    },
    textLinkMuted: {
      ...theme.typography.bodySmall,
      color: theme.palette.textMuted,
      fontWeight: '600',
      textAlign: 'center',
    },
    identityBlock: {
      gap: theme.spacing.sm,
    },
    footer: {
      paddingTop: theme.spacing.sm,
    },
  });
}
