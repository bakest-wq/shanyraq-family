import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { BIRTHDAY_UX } from '@/constants/birthday-content';
import { Motion } from '@/constants/motion';
import { AnimatedPressable } from '@/components/ui/motion/AnimatedPressable';
import { CollapsibleSection } from '@/components/ui/motion/CollapsibleSection';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { Palette, Spacing, Typography } from '@/constants/theme';

type BirthdaySectionProps = {
  icon: string;
  title: string;
  subtitle?: string;
  count?: number;
  collapsible?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  emptyMessage?: string;
  children: ReactNode;
};

export function BirthdaySection({
  icon,
  title,
  subtitle,
  count,
  collapsible = false,
  expanded = true,
  onToggle,
  emptyMessage,
  children,
}: BirthdaySectionProps) {
  const { reduced, duration } = useMotionPreference();
  const hasContent = count === undefined || count > 0;
  const showBody = expanded && hasContent;
  const showEmpty = expanded && !hasContent && emptyMessage;
  const layoutMs = duration(Motion.collapse.duration);

  const sectionBody = (
    <>
      <AnimatedPressable
        onPress={collapsible ? onToggle : undefined}
        disabled={!collapsible}
        style={styles.header}
        accessibilityRole={collapsible ? 'button' : undefined}
        accessibilityState={{ expanded: collapsible ? expanded : undefined }}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {icon} {title}
            {count !== undefined ? ` · ${count}` : ''}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {collapsible ? (
          <Text style={styles.toggleLabel}>
            {expanded ? BIRTHDAY_UX.collapseAll : BIRTHDAY_UX.expandAll}
          </Text>
        ) : null}
      </AnimatedPressable>

      <CollapsibleSection expanded={showBody} style={styles.list}>
        {children}
      </CollapsibleSection>

      <CollapsibleSection expanded={Boolean(showEmpty)}>
        <Text style={styles.empty}>{emptyMessage}</Text>
      </CollapsibleSection>
    </>
  );

  if (reduced) {
    return <View style={styles.section}>{sectionBody}</View>;
  }

  return (
    <Animated.View
      layout={LinearTransition.duration(layoutMs).easing(Motion.easing.inOut)}
      style={styles.section}>
      {sectionBody}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Typography.subtitle,
    color: Palette.textPrimary,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
  },
  toggleLabel: {
    ...Typography.caption,
    color: Palette.greenMid,
    fontWeight: '600',
    paddingTop: 4,
  },
  list: {
    gap: Spacing.lg,
  },
  empty: {
    ...Typography.bodySmall,
    color: Palette.textMuted,
    paddingLeft: Spacing.xs,
  },
});
