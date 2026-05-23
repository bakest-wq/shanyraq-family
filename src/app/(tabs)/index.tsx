import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { QuickActionButton } from '@/components/ui/QuickActionButton';
import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { FAMILY_GREETING } from '@/data/mockData';
import { useFamily } from '@/hooks/useFamily';
import { useRelatives } from '@/hooks/useRelatives';
import {
  daysUntilBirthday,
  formatBirthdayKzRu,
  formatDaysUntil,
  formatTodayDate,
  getAgeLabel,
  isBirthdayToday,
  calculateAge,
} from '@/utils/dates';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useFamily();
  const { livingRelatives, loading, error } = useRelatives();
  const today = new Date();

  const todayBirthdays = livingRelatives.filter(
    (r) => r.birthday && isBirthdayToday(r.birthday, today),
  );

  const upcoming = livingRelatives
    .filter((r) => r.birthday && !isBirthdayToday(r.birthday, today))
    .map((r) => ({ relative: r, days: daysUntilBirthday(r.birthday, today) }))
    .sort((a, b) => a.days - b.days)[0];

  return (
    <ScreenShell
      header={
        <AppHeader
          title="Shanyraq Family"
          subtitle="Шаңырақ · Семейный очаг"
          badge={session?.familyName ?? 'Отбасы'}
          onBadgePress={() => router.push('/settings')}
        />
      }>
      <View style={styles.greetingBlock}>
        <Text style={styles.greeting}>{FAMILY_GREETING}</Text>
        <Text style={styles.greetingSub}>Қош келдіңіз · Добро пожаловать домой</Text>
      </View>

      <Card goldBorder>
        <SectionTitle title="Сегодня" subtitle={formatTodayDate(today)} />
        {loading ? (
          <LoadingState message="Туыстар жүктелуде..." />
        ) : error ? (
          <Text style={styles.calmText}>{error}</Text>
        ) : todayBirthdays.length > 0 ? (
          todayBirthdays.map((person) => (
            <View key={person.id} style={styles.todayRow}>
              <AvatarPlaceholder name={person.fullName} color={person.avatarColor} size={52} />
              <View style={styles.todayInfo}>
                <Text style={styles.todayHighlight}>🎂 Туған күн · День рождения!</Text>
                <Text style={styles.todayName}>{person.fullName}</Text>
                <Text style={styles.todayMeta}>
                  {person.relationship}
                  {calculateAge(person.birthday, today) !== null
                    ? ` · ${getAgeLabel(calculateAge(person.birthday, today)!)}`
                    : ''}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.calmText}>Бүгін тыныш күн. Отдыхайте с семьёй ☕</Text>
        )}
      </Card>

      {!loading && !error && upcoming ? (
        <Card>
          <SectionTitle title="Жақын туған күн" subtitle="Ближайший день рождения" />
          <View style={styles.upcomingRow}>
            <AvatarPlaceholder
              name={upcoming.relative.fullName}
              color={upcoming.relative.avatarColor}
              size={56}
            />
            <View style={styles.upcomingInfo}>
              <Text style={styles.upcomingName}>{upcoming.relative.fullName}</Text>
              <Text style={styles.upcomingRole}>
                {upcoming.relative.relationship} · {formatBirthdayKzRu(upcoming.relative.birthday)}
              </Text>
              <Text style={styles.upcomingDays}>{formatDaysUntil(upcoming.days)}</Text>
            </View>
          </View>
        </Card>
      ) : null}

      <View style={styles.actionsBlock}>
        <SectionTitle title="Жылдам әрекет" subtitle="Быстрые действия" />
        <View style={styles.actionsList}>
          <QuickActionButton
            icon="➕"
            label="Добавить родственника"
            sublabel="Туыс қосу"
            variant="green"
            onPress={() => router.push('/add-relative')}
          />
          <QuickActionButton
            icon="📅"
            label="Календарь"
            sublabel="Күнтізбе"
            variant="gold"
            onPress={() => router.push('/calendar')}
          />
          <QuickActionButton
            icon="🌳"
            label="Семейное дерево"
            sublabel="Отбасы ағашы"
            onPress={() => router.push('/shezhire')}
          />
          <QuickActionButton
            icon="⚙️"
            label="Настройки"
            sublabel="Баптаулар · Семья"
            variant="gold"
            onPress={() => router.push('/settings')}
          />
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  greetingBlock: {
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  greeting: {
    ...Typography.hero,
    color: Palette.greenDeep,
  },
  greetingSub: {
    ...Typography.body,
    color: Palette.textSecondary,
  },
  todayRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  todayInfo: {
    flex: 1,
    gap: 2,
  },
  todayHighlight: {
    ...Typography.bodySmall,
    color: Palette.gold,
    fontWeight: '700',
  },
  todayName: {
    ...Typography.subtitle,
    color: Palette.textPrimary,
  },
  todayMeta: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
  },
  calmText: {
    ...Typography.body,
    color: Palette.textSecondary,
    marginTop: Spacing.sm,
  },
  upcomingRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  upcomingInfo: {
    flex: 1,
    gap: 2,
  },
  upcomingName: {
    ...Typography.subtitle,
    color: Palette.textPrimary,
  },
  upcomingRole: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
  },
  upcomingDays: {
    ...Typography.bodySmall,
    color: Palette.greenMid,
    fontWeight: '700',
  },
  actionsBlock: {
    gap: Spacing.md,
  },
  actionsList: {
    gap: Spacing.sm,
  },
});
