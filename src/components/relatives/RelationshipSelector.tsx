import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  RELATIONSHIP_GROUPS,
  getRelationshipOptionsByGroup,
} from '@/utils/relationship-presets';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type RelationshipSelectorProps = {
  value: string;
  error?: string;
  onChange: (relationship: string) => void;
};

export function RelationshipSelector({ value, error, onChange }: RelationshipSelectorProps) {
  return (
    <View style={styles.wrap}>
      {RELATIONSHIP_GROUPS.map((group) => {
        const options = getRelationshipOptionsByGroup(group.id);

        return (
          <View key={group.id} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.grid}>
              {options.map((option) => {
                const selected = value === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => onChange(option.value)}
                    style={({ pressed }) => [
                      styles.button,
                      selected && styles.buttonSelected,
                      pressed && styles.buttonPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={option.label}>
                    <Text
                      style={[styles.buttonText, selected && styles.buttonTextSelected]}
                      numberOfLines={2}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.lg,
  },
  group: {
    gap: Spacing.sm,
  },
  groupTitle: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  button: {
    width: '48%',
    minHeight: 56,
    borderRadius: Radius.lg,
    backgroundColor: Palette.cream,
    borderWidth: 2,
    borderColor: Palette.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    ...Shadow.soft,
  },
  buttonSelected: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.gold,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonTextSelected: {
    color: Palette.white,
  },
  errorText: {
    ...Typography.caption,
    color: Palette.danger,
    fontWeight: '600',
  },
});
