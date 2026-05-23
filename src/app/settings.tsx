import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { DetailField } from '@/components/ui/DetailField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { QuickActionButton } from '@/components/ui/QuickActionButton';
import { useFamily } from '@/hooks/useFamily';
import {
  buildFamilyInviteMessage,
  copyTextToClipboard,
  formatInviteCodeDisplay,
  openWhatsAppShare,
} from '@/utils/family-invite';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { session, leaveFamily } = useFamily();

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

    const message = buildFamilyInviteMessage(session.familyName, inviteCode);
    openWhatsAppShare(message);
  };

  const handleLeave = () => {
    Alert.alert(
      'Шығу · Выйти',
      'Бұл құрылғыдан отбасынан шығасыз ба? Деректер сақталады.',
      [
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
      ],
    );
  };

  const handleSwitchFamily = () => {
    Alert.alert(
      'Отбасын ауыстыру',
      'Алдымен шығып, жаңа шақыру кодымен қосыла аласыз.',
      [
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
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Артқа</Text>
        </Pressable>

        <Text style={styles.title}>Баптаулар</Text>
        <Text style={styles.subtitle}>Settings · Отбасы және шақыру</Text>

        <Card goldBorder style={styles.card}>
          <Text style={styles.sectionLabel}>Отбасы · Семья</Text>
          <DetailField label="Отбасы орны · Название" value={session?.familyName ?? '—'} />
          <DetailField label="Сіз · Вы" value={session?.ownerName ?? '—'} />
          <DetailField
            label="Роль"
            value={session?.role === 'owner' ? 'Ие · Владелец' : 'Мүше · Участник'}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Еске салулар · Notifications</Text>
          <Text style={styles.inviteIntro}>
            Туған күн және марқұмдарға дұға eskertuleri — локальные push на устройстве.
          </Text>
          <QuickActionButton
            icon="🔔"
            label="Хабарландыру баптаулары"
            sublabel="Туған күн · дұға · тест"
            variant="green"
            onPress={() => router.push('/notification-settings')}
          />
        </Card>

        <Card goldBorder style={styles.card}>
          <Text style={styles.sectionLabel}>Шақыру · Пригласить родных</Text>
          <Text style={styles.inviteIntro}>
            Туыстарыңызға код жіберіңіз — олар отбасы орнына қосыла алады.
          </Text>

          <View style={styles.familyNameBox}>
            <Text style={styles.familyNameLabel}>Отбасы орны</Text>
            <Text style={styles.familyName}>{session?.familyName ?? '—'}</Text>
          </View>

          <View style={styles.inviteBox}>
            <Text style={styles.inviteLabel}>Шақыру коды · Invite code</Text>
            <Text style={styles.inviteCode} accessibilityLabel={`Код ${inviteDisplay}`}>
              {inviteDisplay}
            </Text>
          </View>

          <Text style={styles.messagePreview} numberOfLines={6}>
            {session?.familyName
              ? buildFamilyInviteMessage(session.familyName, inviteCode)
              : '—'}
          </Text>

          <View style={styles.inviteActions}>
            <QuickActionButton
              icon="📋"
              label="Кодты көшіру · Скопировать код"
              variant="green"
              onPress={() => void handleCopyCode()}
            />
            <QuickActionButton
              icon="💬"
              label="WhatsApp арқылы шақыру · Пригласить через WhatsApp"
              variant="gold"
              onPress={handleWhatsAppShare}
            />
          </View>
        </Card>

        <View style={styles.actions}>
          <PrimaryButton
            label="Отбасын ауыстыру"
            sublabel="Switch family · join with code"
            variant="gold"
            onPress={handleSwitchFamily}
          />
          <PrimaryButton
            label="Отбасынан шығу"
            sublabel="Logout · локальный выход"
            variant="green"
            onPress={handleLeave}
          />
        </View>
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
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingTop: Spacing.sm,
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
  },
  card: {
    gap: Spacing.md,
  },
  sectionLabel: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  inviteIntro: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    lineHeight: 24,
  },
  familyNameBox: {
    backgroundColor: Palette.white,
    borderRadius: 16,
    padding: Spacing.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Palette.creamDark,
  },
  familyNameLabel: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  familyName: {
    ...Typography.subtitle,
    color: Palette.greenDeep,
  },
  inviteBox: {
    backgroundColor: Palette.creamDark,
    borderRadius: 20,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 2,
    borderColor: Palette.gold,
  },
  inviteLabel: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  inviteCode: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700',
    color: Palette.greenDeep,
    letterSpacing: 4,
  },
  messagePreview: {
    ...Typography.bodySmall,
    color: Palette.greenMid,
    lineHeight: 24,
    backgroundColor: Palette.white,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.creamDark,
  },
  inviteActions: {
    gap: Spacing.sm,
  },
  actions: {
    gap: Spacing.sm,
  },
});
