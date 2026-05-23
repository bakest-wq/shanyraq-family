import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReminderSettingsPanel } from '@/components/calendar/ReminderSettingsPanel';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  REMINDER_TIME_OPTIONS,
} from '@/types/reminders';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { settings, loading, permissionGranted, updateSetting, updateSettings, sendTest } =
    useNotificationSettings();

  const current = settings ?? DEFAULT_NOTIFICATION_SETTINGS;

  const handleTest = async () => {
    const sent = await sendTest();

    if (sent) {
      Alert.alert('Тест отправлен', 'Уведомление придёт через пару секунд.');
      return;
    }

    Alert.alert(
      'Не удалось',
      permissionGranted === false
        ? 'Разрешите уведомления в настройках телефона.'
        : 'Тест доступен только на реальном устройстве.',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Артқа</Text>
        </Pressable>

        <Text style={styles.title}>Еске салулар</Text>
        <Text style={styles.subtitle}>Push-хабарламалар · Туған күн және дұға</Text>

        {loading ? (
          <LoadingState message="Баптаулар жүктелуде..." />
        ) : (
          <>
            <Card goldBorder style={styles.card}>
              <View style={styles.row}>
                <View style={styles.textWrap}>
                  <Text style={styles.label}>Все напоминания</Text>
                  <Text style={styles.sublabel}>Барлық eskertuler</Text>
                </View>
                <Switch
                  value={current.enabled}
                  onValueChange={(value) => void updateSetting('enabled', value)}
                  trackColor={{ false: Palette.creamDark, true: Palette.greenSoft }}
                  thumbColor={current.enabled ? Palette.greenDeep : Palette.white}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.textWrap}>
                  <Text style={styles.label}>Звук</Text>
                  <Text style={styles.sublabel}>Дыбыс · notification sound</Text>
                </View>
                <Switch
                  value={current.soundEnabled}
                  onValueChange={(value) => void updateSetting('soundEnabled', value)}
                  trackColor={{ false: Palette.creamDark, true: Palette.greenSoft }}
                  thumbColor={current.soundEnabled ? Palette.greenDeep : Palette.white}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.textWrap}>
                  <Text style={styles.label}>Дұға · Память марқұм</Text>
                  <Text style={styles.sublabel}>Ежегодное напоминание о дуа</Text>
                </View>
                <Switch
                  value={current.memorialEnabled}
                  onValueChange={(value) => void updateSetting('memorialEnabled', value)}
                  trackColor={{ false: Palette.creamDark, true: Palette.greenSoft }}
                  thumbColor={current.memorialEnabled ? Palette.greenDeep : Palette.white}
                />
              </View>

              {permissionGranted === false ? (
                <Text style={styles.permissionHint}>
                  ⚠️ Разрешите уведомления в настройках телефона, чтобы получать напоминания.
                </Text>
              ) : null}
            </Card>

            <ReminderSettingsPanel
              settings={current}
              onToggle={(key, value) => void updateSetting(key, value)}
            />

            <Card style={styles.card}>
              <Text style={styles.sectionLabel}>Уақыт · Время напоминания</Text>
              <View style={styles.timeGrid}>
                {REMINDER_TIME_OPTIONS.map((option) => {
                  const selected =
                    current.reminderHour === option.hour &&
                    current.reminderMinute === option.minute;

                  return (
                    <Pressable
                      key={option.label}
                      onPress={() =>
                        void updateSettings({
                          reminderHour: option.hour,
                          reminderMinute: option.minute,
                        })
                      }
                      style={({ pressed }) => [
                        styles.timeChip,
                        selected && styles.timeChipSelected,
                        pressed && styles.pressed,
                      ]}>
                      <Text style={[styles.timeChipText, selected && styles.timeChipTextSelected]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>

            <Card style={styles.previewCard}>
              <Text style={styles.sectionLabel}>Мысал · Preview</Text>
              <Text style={styles.previewLine}>🎂 Сегодня день рождения Алии апа</Text>
              <Text style={styles.previewLine}>🤲 Не забудьте прочитать дуа за аташку</Text>
            </Card>

            <PrimaryButton
              label="Отправить тестовое уведомление"
              sublabel="2 секундтан кейін · Test push"
              variant="gold"
              onPress={() => void handleTest()}
            />
          </>
        )}
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
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    backgroundColor: Palette.cream,
    borderRadius: 16,
    padding: Spacing.md,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  sublabel: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  permissionHint: {
    ...Typography.bodySmall,
    color: Palette.danger,
    lineHeight: 22,
  },
  sectionLabel: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  timeChip: {
    minWidth: '47%',
    flexGrow: 1,
    backgroundColor: Palette.cream,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },
  timeChipSelected: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.gold,
  },
  timeChipText: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  timeChipTextSelected: {
    color: Palette.white,
  },
  pressed: {
    opacity: 0.92,
  },
  previewCard: {
    backgroundColor: Palette.creamDark,
    gap: Spacing.sm,
  },
  previewLine: {
    ...Typography.body,
    color: Palette.greenMid,
    lineHeight: 26,
  },
});
