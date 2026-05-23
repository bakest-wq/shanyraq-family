import { StyleSheet, View } from 'react-native';

import { HelperHintBanner } from '@/components/ui/HelperHintBanner';
import { SHEZHIRE_FOCUSED_ROOT } from '@/constants/family-ux-content';
import { Spacing } from '@/constants/theme';

export function ShezhireHelperBanner() {
  return (
    <View style={styles.wrap}>
      <HelperHintBanner
        icon="🌳"
        text={SHEZHIRE_FOCUSED_ROOT.helper.title}
        subtext={SHEZHIRE_FOCUSED_ROOT.helper.subtitle}
        tone="cream"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
  },
});
