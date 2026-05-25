import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ROOT_IDENTITY_COPY } from '@/constants/root-identity-content';
import { useRootPersonIdentity } from '@/hooks/useRootPersonIdentity';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type RootPersonIdentityBannerProps = {
  compact?: boolean;
};

/** Shows who kinship labels are calculated from; one tap returns to «Мен». */
export function RootPersonIdentityBanner({ compact = false }: RootPersonIdentityBannerProps) {
  const { rootDisplayName, isMeRoot, isReady, resetToMe } = useRootPersonIdentity();

  if (!isReady) {
    return null;
  }

  if (isMeRoot) {
    return null;
  }

  return (
    <View style={[styles.banner, compact && styles.bannerCompact]}>
      <View style={styles.copyBlock}>
        <Text style={styles.title}>{ROOT_IDENTITY_COPY.viewingAs(rootDisplayName)}</Text>
        {!compact ? <Text style={styles.hint}>{ROOT_IDENTITY_COPY.viewingHint}</Text> : null}
      </View>
      <Pressable
        onPress={resetToMe}
        style={({ pressed }) => [styles.meButton, pressed && styles.meButtonPressed]}
        accessibilityRole="button"
        accessibilityLabel={ROOT_IDENTITY_COPY.backToMeHint}>
        <Text style={styles.meButtonText}>{ROOT_IDENTITY_COPY.backToMe}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    backgroundColor: Palette.cream,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.goldLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  bannerCompact: {
    paddingVertical: Spacing.xs,
  },
  copyBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  hint: {
    ...Typography.caption,
    color: Palette.textSecondary,
    lineHeight: 18,
  },
  meButton: {
    backgroundColor: Palette.greenDeep,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  meButtonPressed: {
    opacity: 0.88,
  },
  meButtonText: {
    ...Typography.caption,
    color: Palette.white,
    fontWeight: '800',
  },
});
