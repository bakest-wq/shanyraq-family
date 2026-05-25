import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useCalmUx } from '@/hooks/useCalmUx';

type HelperHintBannerProps = {
  icon?: string;
  text: string;
  subtext?: string;
  tone?: 'cream' | 'white';
};

/** Soft hint banner — calm tone, no alarm colors. */
export function HelperHintBanner({
  icon = '🌿',
  text,
  subtext,
  tone = 'white',
}: HelperHintBannerProps) {
  const { theme, calm } = useCalmUx();
  const styles = useMemo(() => createStyles(theme, calm), [calm, theme]);

  return (
    <View style={[styles.banner, tone === 'cream' ? styles.bannerCream : styles.bannerWhite]}>
      <View style={styles.iconColumn}>
        <View style={styles.iconDot} />
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.textColumn}>
        <Text style={styles.text}>{text}</Text>
        {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
      </View>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useCalmUx>['theme'], calm: ReturnType<typeof useCalmUx>['calm']) {
  return StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.palette.goldLight,
      padding: theme.spacing.md,
      minHeight: calm.minTouchHeight,
    },
    bannerWhite: {
      backgroundColor: calm.surfaceRaised,
    },
    bannerCream: {
      backgroundColor: calm.surfaceSoft,
    },
    iconColumn: {
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingTop: 2,
    },
    iconDot: {
      width: 6,
      height: 6,
      borderRadius: theme.radius.full,
      backgroundColor: theme.palette.gold,
    },
    icon: {
      fontSize: 22,
    },
    textColumn: {
      flex: 1,
      gap: 4,
    },
    text: {
      ...theme.typography.bodySmall,
      color: theme.palette.greenDeep,
      fontWeight: '700',
      lineHeight: 22,
    },
    subtext: {
      ...theme.typography.caption,
      color: theme.palette.textSecondary,
      lineHeight: 20,
    },
  });
}
