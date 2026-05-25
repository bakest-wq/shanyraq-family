import { StyleSheet, Switch, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { ELDER_MODE_COPY } from '@/constants/elder-mode-content';
import { ELDER_MODE_RESET_COPY } from '@/constants/settings-access-content';
import { useAppTheme, useElderMode } from '@/hooks/useElderMode';

export function ElderModeSettingsCard() {
  const { enabled, setEnabled } = useElderMode();
  const theme = useAppTheme();

  const styles = createStyles(theme);

  return (
    <Card goldBorder style={styles.card}>
      <SectionTitle
        title={ELDER_MODE_COPY.settingsSection}
        subtitle={ELDER_MODE_COPY.settingsSectionHint}
      />

      <View style={styles.row}>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{ELDER_MODE_COPY.title}</Text>
          <Text style={styles.subtitle}>{ELDER_MODE_COPY.subtitle}</Text>
          <Text style={styles.hint}>{ELDER_MODE_COPY.hint}</Text>
          <Text style={styles.status}>{enabled ? ELDER_MODE_COPY.enabled : ELDER_MODE_COPY.disabled}</Text>
        </View>

        <Switch
          value={enabled}
          onValueChange={(value) => void setEnabled(value)}
          trackColor={{ false: theme.palette.creamDark, true: theme.palette.greenSoft }}
          thumbColor={enabled ? theme.palette.greenDeep : theme.palette.white}
          accessibilityRole="switch"
          accessibilityLabel={ELDER_MODE_COPY.title}
        />
      </View>

      {enabled ? (
        <PrimaryButton
          label={ELDER_MODE_RESET_COPY.resetToNormal.kk}
          sublabel={ELDER_MODE_RESET_COPY.resetToNormalHint.kk}
          variant="gold"
          onPress={() => void setEnabled(false)}
        />
      ) : null}
    </Card>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    card: {
      gap: theme.spacing.md,
      borderWidth: theme.layout.cardBorderWidth,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    textWrap: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    title: {
      ...theme.typography.subtitle,
      color: theme.palette.greenDeep,
      fontWeight: '800',
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.palette.textPrimary,
      lineHeight: 26,
    },
    hint: {
      ...theme.typography.bodySmall,
      color: theme.palette.textSecondary,
      lineHeight: 24,
    },
    status: {
      ...theme.typography.caption,
      color: theme.palette.greenMid,
      fontWeight: '800',
    },
  });
}
