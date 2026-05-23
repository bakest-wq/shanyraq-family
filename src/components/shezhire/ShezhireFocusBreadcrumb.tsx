import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ShezhireFocusCrumb } from '@/utils/shezhire-focus-navigation';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type ShezhireFocusBreadcrumbProps = {
  crumbs: ShezhireFocusCrumb[];
  activeRootId: string;
  onSelect: (relativeId: string) => void;
};

export function ShezhireFocusBreadcrumb({
  crumbs,
  activeRootId,
  onSelect,
}: ShezhireFocusBreadcrumbProps) {
  if (crumbs.length <= 1) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist">
      {crumbs.map((crumb, index) => {
        const isActive = crumb.id === activeRootId;
        const isLast = index === crumbs.length - 1;

        return (
          <View key={crumb.id} style={styles.itemWrap}>
            <Pressable
              onPress={() => onSelect(crumb.id)}
              disabled={isActive}
              style={({ pressed }) => [
                styles.crumb,
                isActive && styles.crumbActive,
                pressed && !isActive && styles.crumbPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}>
              <Text
                style={[styles.crumbText, isActive && styles.crumbTextActive]}
                numberOfLines={1}>
                {crumb.label}
              </Text>
            </Pressable>
            {!isLast ? <Text style={styles.separator}>→</Text> : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  itemWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  crumb: {
    maxWidth: 148,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.goldLight,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  crumbActive: {
    borderColor: Palette.greenDeep,
    backgroundColor: '#F4FAF6',
  },
  crumbPressed: {
    opacity: 0.88,
  },
  crumbText: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  crumbTextActive: {
    color: Palette.greenDeep,
    fontWeight: '800',
  },
  separator: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
  },
});
