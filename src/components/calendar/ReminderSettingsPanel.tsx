import { StyleSheet, Switch, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { REMINDER_OPTIONS, BirthdayReminderSettings } from '@/types/reminders';
import { Palette, Spacing, Typography } from '@/constants/theme';

type ReminderSettingsPanelProps = {
  settings: BirthdayReminderSettings;
  onToggle: (key: keyof BirthdayReminderSettings, value: boolean) => void;
};

export function ReminderSettingsPanel({ settings, onToggle }: ReminderSettingsPanelProps) {
  return (
    <Card goldBorder style={styles.card}>
      <SectionTitle
        title="Еске салулар"
        subtitle="Push-напоминания · туған күн"
      />
      <View style={styles.list}>
        {REMINDER_OPTIONS.map((option) => (
          <View key={option.key} style={styles.row}>
            <View style={styles.textWrap}>
              <Text style={styles.label}>{option.label}</Text>
              <Text style={styles.sublabel}>{option.sublabel}</Text>
            </View>
            <Switch
              value={settings[option.key]}
              onValueChange={(value) => onToggle(option.key, value)}
              trackColor={{ false: Palette.creamDark, true: Palette.greenSoft }}
              thumbColor={settings[option.key] ? Palette.greenDeep : Palette.white}
            />
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
  },
  list: {
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
});
