import { useMemo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { DisclosureSection } from '@/components/ui/motion/DisclosureSection';
import { CALM_UX, type CalmUxSectionKey } from '@/constants/calm-ux';
import { useCalmUx } from '@/hooks/useCalmUx';

type CalmDisclosureProps = {
  section: CalmUxSectionKey;
  defaultExpanded?: boolean;
  children: ReactNode;
};

/** Progressive disclosure block with calm copy — hides secondary content by default. */
export function CalmDisclosure({
  section,
  defaultExpanded = false,
  children,
}: CalmDisclosureProps) {
  const { calm } = useCalmUx();
  const styles = useMemo(() => createStyles(calm.softGap), [calm.softGap]);
  const copy = CALM_UX.sections[section];

  return (
    <View style={styles.wrap}>
      <DisclosureSection
        title={copy.title}
        subtitle={copy.subtitle}
        defaultExpanded={defaultExpanded}>
        {children}
      </DisclosureSection>
    </View>
  );
}

function createStyles(gap: number) {
  return StyleSheet.create({
    wrap: {
      gap,
    },
  });
}
