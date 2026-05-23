import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { USER_IDENTITY_COPY } from '@/constants/user-identity-content';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type UserIdentityPromptBannerProps = {
  compact?: boolean;
};

export function UserIdentityPromptBanner({ compact = false }: UserIdentityPromptBannerProps) {
  const router = useRouter();
  const { hasLinkedRelative, isReady } = useUserIdentity();

  if (!isReady || hasLinkedRelative) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <View style={styles.iconColumn}>
        <Text style={styles.icon}>👤</Text>
      </View>
      <View style={styles.textColumn}>
        <Text style={styles.text}>{USER_IDENTITY_COPY.onboardingPrompt}</Text>
        {!compact ? (
          <Text style={styles.subtext}>{USER_IDENTITY_COPY.onboardingSubtext}</Text>
        ) : null}
        <Pressable
          onPress={() => router.push('/who-am-i')}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
          accessibilityRole="button"
          accessibilityLabel={USER_IDENTITY_COPY.openWhoAmI}>
          <Text style={styles.actionText}>{USER_IDENTITY_COPY.openWhoAmI}</Text>
        </Pressable>
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
    borderWidth: 1.5,
    borderColor: Palette.gold,
    backgroundColor: '#FFF9EA',
    padding: Spacing.md,
  },
  iconColumn: {
    paddingTop: 2,
  },
  icon: {
    fontSize: 24,
  },
  textColumn: {
    flex: 1,
    gap: Spacing.sm,
  },
  text: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '800',
    lineHeight: 22,
  },
  subtext: {
    ...Typography.caption,
    color: Palette.textSecondary,
    lineHeight: 20,
  },
  actionButton: {
    alignSelf: 'flex-start',
    minHeight: 36,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Palette.greenDeep,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionPressed: {
    opacity: 0.92,
  },
  actionText: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
});
