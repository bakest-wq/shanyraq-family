import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/hooks/useElderMode';
import type { Relative } from '@/types/relative';
import {
  getMissingLinkActionLabel,
  type MissingLinkKind,
} from '@/utils/missing-link-actions';
import { buildProfileMissingLinkParams } from '@/utils/profile-family-links';
import { Palette, Radius } from '@/constants/theme';

type RelativeProfileAddFamilyLinkProps = {
  kind: MissingLinkKind;
  targetPerson: Relative;
  spouse?: Relative | null;
};

export function RelativeProfileAddFamilyLink({
  kind,
  targetPerson,
  spouse = null,
}: RelativeProfileAddFamilyLinkProps) {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const label = getMissingLinkActionLabel(kind);

  const handlePress = () => {
    router.push({
      pathname: '/add-relative',
      params: buildProfileMissingLinkParams(kind, targetPerson, spouse),
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: Math.max(theme.layout.touchTarget, 48),
      borderRadius: Radius.lg,
      borderWidth: 1.5,
      borderColor: '#D8CEBC',
      borderStyle: 'dashed',
      backgroundColor: Palette.white,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    pressed: {
      opacity: 0.92,
      backgroundColor: '#F7F4EE',
    },
    buttonText: {
      ...theme.typography.bodySmall,
      color: theme.palette.greenDeep,
      fontWeight: '700',
      textAlign: 'center',
    },
  });
}
