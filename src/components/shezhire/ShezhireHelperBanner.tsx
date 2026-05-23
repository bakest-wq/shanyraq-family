import { StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

export function ShezhireHelperBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>🌿</Text>
      <Text style={styles.text}>
        Әke, аna және жұбай байланыстары арқылы шежіре автоматты түрде құрылады.
      </Text>
      <Text style={styles.subtext}>
        Жоғарыда: ата-ана · төменде: балалар · Parents row, children row.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.goldLight,
    padding: Spacing.lg,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  text: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  },
  subtext: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
