import { useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/motion/AnimatedPressable';
import { CollapsibleSection } from '@/components/ui/motion/CollapsibleSection';
import { COGNITIVE_LOAD_COPY } from '@/constants/cognitive-load-content';
import { useCalmUx } from '@/hooks/useCalmUx';

type DisclosureSectionProps = {
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
  children: ReactNode;
};

/** Progressive disclosure — hide secondary content until the user asks for it. */
export function DisclosureSection({
  title,
  subtitle,
  defaultExpanded = false,
  children,
}: DisclosureSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { theme, calm } = useCalmUx();
  const styles = useMemo(() => createStyles(theme, calm), [calm, theme]);

  return (
    <View style={styles.wrap}>
      <AnimatedPressable
        onPress={() => setExpanded((current) => !current)}
        style={styles.header}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={title}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <Text style={styles.toggle}>
          {expanded ? COGNITIVE_LOAD_COPY.collapse : COGNITIVE_LOAD_COPY.expand}
        </Text>
      </AnimatedPressable>

      <CollapsibleSection expanded={expanded} style={styles.body}>
        {children}
      </CollapsibleSection>
    </View>
  );
}

function createStyles(
  theme: ReturnType<typeof useCalmUx>['theme'],
  calm: ReturnType<typeof useCalmUx>['calm'],
) {
  return StyleSheet.create({
    wrap: {
      gap: theme.spacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      paddingVertical: calm.touchPaddingVertical,
      minHeight: calm.minTouchHeight,
    },
    headerText: {
      flex: 1,
      gap: 2,
    },
    title: {
      ...theme.typography.bodySmall,
      color: theme.palette.greenDeep,
      fontWeight: '700',
    },
    subtitle: {
      ...theme.typography.caption,
      color: theme.palette.textSecondary,
      lineHeight: 18,
    },
    toggle: {
      ...theme.typography.caption,
      color: theme.palette.greenMid,
      fontWeight: '700',
      paddingTop: 2,
    },
    body: {
      gap: calm.softGap,
      paddingTop: theme.spacing.xs,
    },
  });
}
