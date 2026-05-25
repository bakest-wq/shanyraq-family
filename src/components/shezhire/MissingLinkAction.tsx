import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import type { Relative } from '@/types/relative';
import {
  buildMissingLinkNavigateParams,
  getMissingLinkActionLabel,
  type MissingLinkKind,
} from '@/utils/missing-link-actions';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type MissingLinkActionProps = {
  kind: MissingLinkKind;
  targetPerson: Relative;
  shezhireRootId: string;
  spouse?: Relative | null;
  compact?: boolean;
};

export function MissingLinkAction({
  kind,
  targetPerson,
  shezhireRootId,
  spouse = null,
  compact = false,
}: MissingLinkActionProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/add-relative',
      params: buildMissingLinkNavigateParams(kind, targetPerson, {
        shezhireRootId,
        spouse,
      }),
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        pressed && styles.buttonPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={getMissingLinkActionLabel(kind)}>
      <Text style={[styles.buttonText, compact && styles.buttonTextCompact]}>
        {getMissingLinkActionLabel(kind)}
      </Text>
    </Pressable>
  );
}

type ParentMissingSlotProps = {
  role: 'father' | 'mother';
  targetPerson: Relative;
  shezhireRootId: string;
};

export function ParentMissingSlot({
  role,
  targetPerson,
  shezhireRootId,
}: ParentMissingSlotProps) {
  const kind = role === 'father' ? 'father' : 'mother';

  return (
    <MissingLinkAction
      kind={kind}
      targetPerson={targetPerson}
      shezhireRootId={shezhireRootId}
      compact
    />
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    borderStyle: 'dashed',
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  buttonCompact: {
    minHeight: 38,
    paddingHorizontal: Spacing.sm,
  },
  buttonPressed: {
    opacity: 0.92,
    backgroundColor: '#F7F4EE',
  },
  buttonText: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonTextCompact: {
    fontSize: 12,
    lineHeight: 16,
  },
});
