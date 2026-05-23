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
      Alert.alert('Код жоқ', 'Код приглашения недоступен.');
      return;
    }

    await copyTextToClipboard(formatInviteCodeDisplay(inviteCode));
    Alert.alert('Скопировано', `Код ${formatInviteCodeDisplay(inviteCode)} скопирован.`);
  };

  const handleWhatsAppShare = () => {
    if (!session?.familyName || !inviteCode) {
      Alert.alert('Қате', 'Не удалось подготовить приглашение.');
      return;
    }

    const message = buildFamilyInviteMessage(session.familyName, inviteCode);
    openWhatsAppShare(message);
  };

  const handleLeave = () => {
    Alert.alert(
      'Шығу · Выйти',
      'Выйти из семьи на этом устройстве? Данные семьи останутся в облаке.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
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
      'Сменить семью',
      'Выйдите из текущей семьи и присоединитесь к другой по коду приглашения.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти и сменить',
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
        <Text style={styles.subtitle}>Settings · Семья и приглашения</Text>

        <Card goldBorder style={styles.card}>
          <Text style={styles.sectionLabel}>Отбасы · Семья</Text>
          <DetailField label="Название семьи" value={session?.familyName ?? '—'} />
          <DetailField label="Вы" value={session?.ownerName ?? '—'} />
          <DetailField
            label="Роль"
            value={session?.role === 'owner' ? 'Владелец · ие' : 'Участник · мүше'}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Еске салулар · Notifications</Text>
          <Text style={styles.inviteIntro}>
            Туған күн және марқұмдарға дұға eskertuleri — локальные push на устройстве.
          </Text>
          <QuickActionButton
            icon="🔔"
            label="Настройки уведомлений"
            sublabel="Туған күн · дұға · тест"
            variant="green"
            onPress={() => router.push('/notification-settings')}
          />
        </Card>

        <Card goldBorder style={styles.card}>
          <Text style={styles.sectionLabel}>Шақыру · Пригласить родных</Text>
          <Text style={styles.inviteIntro}>
            Отправьте код родным — они смогут присоединиться к вашему семейному пространству.
          </Text>

          <View style={styles.inviteBox}>
            <Text style={styles.inviteLabel}>Код приглашения</Text>
            <Text style={styles.inviteCode} accessibilityLabel={`Код ${inviteDisplay}`}>
              {inviteDisplay}
            </Text>
          </View>

          <Text style={styles.messagePreview} numberOfLines={4}>
            {session?.familyName
              ? buildFamilyInviteMessage(session.familyName, inviteCode)
              : '—'}
          </Text>

          <View style={styles.inviteActions}>
            <QuickActionButton
              icon="📋"
              label="Скопировать код"
              sublabel="Copy invite code"
              variant="green"
              onPress={() => void handleCopyCode()}
            />
            <QuickActionButton
              icon="💬"
              label="Поделиться в WhatsApp"
              sublabel="Share invite message"
              variant="gold"
              onPress={handleWhatsAppShare}
            />
          </View>
        </Card>

        <View style={styles.actions}>
          <PrimaryButton
            label="Сменить семью"
            sublabel="Join another family"
            variant="gold"
            onPress={handleSwitchFamily}
          />
          <PrimaryButton
            label="Выйти из семьи"
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
