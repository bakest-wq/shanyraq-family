import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SettingsAccessButton } from '@/components/ui/SettingsAccessButton';
import { useAppTheme } from '@/hooks/useElderMode';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  onBadgePress?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Settings gear stays visible by default — critical navigation. */
  showSettings?: boolean;
};

export function AppHeader({
  title,
  subtitle,
  badge,
  onBadgePress,
  onRefresh,
  refreshing = false,
  showSettings = true,
}: AppHeaderProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const touchTarget = Math.max(theme.layout.touchTarget, 44);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.leading}>
          <View style={[styles.brandMark, { width: touchTarget, height: touchTarget }]}>
            <Text style={styles.brandIcon}>🏠</Text>
          </View>
        </View>

        <View style={styles.trailing}>
          {onRefresh ? (
            <Pressable
              onPress={refreshing ? undefined : onRefresh}
              style={({ pressed }) => [
                styles.refreshButton,
                { width: touchTarget, height: touchTarget, borderRadius: touchTarget / 2 },
                refreshing && styles.refreshButtonDisabled,
                pressed && !refreshing && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Жаңарту">
              <Text style={styles.refreshText}>{refreshing ? '…' : '↻'}</Text>
            </Pressable>
          ) : null}
          {badge ? (
            onBadgePress ? (
              <Pressable onPress={onBadgePress} style={styles.badge}>
                <Text style={styles.badgeText} numberOfLines={1}>
                  {badge}
                </Text>
              </Pressable>
            ) : (
              <View style={styles.badge}>
                <Text style={styles.badgeText} numberOfLines={1}>
                  {badge}
                </Text>
              </View>
            )
          ) : null}
          {showSettings ? <SettingsAccessButton /> : null}
        </View>
      </View>

      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {subtitle && !theme.elderMode ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
      gap: theme.spacing.sm,
      backgroundColor: theme.palette.cream,
      overflow: 'visible',
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
      overflow: 'visible',
    },
    leading: {
      flexShrink: 1,
      minWidth: 0,
    },
    trailing: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      flexShrink: 0,
      gap: theme.spacing.sm,
      zIndex: 10,
    },
    refreshButton: {
      backgroundColor: theme.palette.white,
      borderWidth: theme.elderMode ? 2 : 1,
      borderColor: theme.palette.goldLight,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    refreshButtonDisabled: {
      opacity: 0.5,
    },
    refreshText: {
      ...theme.typography.body,
      color: theme.palette.greenDeep,
      fontWeight: '800',
      lineHeight: 24,
    },
    pressed: {
      opacity: 0.85,
    },
    brandMark: {
      borderRadius: 14,
      backgroundColor: theme.palette.greenDeep,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    brandIcon: {
      fontSize: theme.elderMode ? 26 : 22,
    },
    badge: {
      backgroundColor: theme.palette.goldLight,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: 999,
      minHeight: Math.max(theme.layout.touchTarget, 44),
      maxWidth: 120,
      justifyContent: 'center',
      flexShrink: 1,
    },
    badgeText: {
      ...theme.typography.caption,
      color: theme.palette.greenDeep,
      fontWeight: '800',
      textAlign: 'center',
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
      flexShrink: 1,
      flexWrap: 'wrap',
    },
  });
}
