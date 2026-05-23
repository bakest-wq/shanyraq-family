import { StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type HelperHintBannerProps = {
  icon?: string;
  text: string;
  subtext?: string;
  tone?: 'cream' | 'white';
};

export function HelperHintBanner({
  icon = '🌿',
  text,
  subtext,
  tone = 'white',
}: HelperHintBannerProps) {
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

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.goldLight,
    padding: Spacing.md,
  },
  bannerWhite: {
    backgroundColor: Palette.white,
  },
  bannerCream: {
    backgroundColor: Palette.cream,
  },
  iconColumn: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: 2,
  },
  iconDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Palette.gold,
  },
  icon: {
    fontSize: 22,
  },
  textColumn: {
    flex: 1,
    gap: 4,
  },
  text: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
    lineHeight: 22,
  },
  subtext: {
    ...Typography.caption,
    color: Palette.textSecondary,
    lineHeight: 20,
  },
});
