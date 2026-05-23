import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  COMPACT_CHILDREN_THRESHOLD,
  FamilyTreeCard,
  getCompactChildrenLayout,
} from '@/components/shezhire/FamilyTreeCard';
import { Card } from '@/components/ui/Card';
import { FamilyUnit } from '@/utils/family-tree';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type FamilyUnitBlockProps = {
  unit: FamilyUnit;
  onOpenRelative: (relativeId: string) => void;
  onAddChild: (unit: FamilyUnit) => void;
};

function getParentsSubtitle(unit: FamilyUnit): string | null {
  if (unit.layout === 'couple' && unit.father && unit.mother) {
    return `${getRelativeDisplayName(unit.father)} · ${getRelativeDisplayName(unit.mother)}`;
  }

  if (unit.father) {
    return getRelativeDisplayName(unit.father);
  }

  if (unit.mother) {
    return getRelativeDisplayName(unit.mother);
  }

  return null;
}

export function FamilyUnitBlock({ unit, onOpenRelative, onAddChild }: FamilyUnitBlockProps) {
  const isSingleParent = unit.layout !== 'couple';
  const isCouple = unit.layout === 'couple';
  const parentsSubtitle = getParentsSubtitle(unit);
  const childLayout = getCompactChildrenLayout(unit.children.length);
  const hasChildren = unit.children.length > 0;
  const childrenCountLabel = hasChildren
    ? unit.children.length === 1
      ? '1 бала · 1 ребёнок'
      : `${unit.children.length} бала · ${unit.children.length} детей`
    : 'Балалар жоқ · Детей пока нет';

  return (
    <Card goldBorder style={styles.block}>
      <View style={[styles.parentsSection, isSingleParent && styles.parentsSectionSingle]}>
        <Text style={styles.generationTitle}>
          {isCouple ? 'Жұбай жұбы · Couple' : 'Ата-ана · Parent'}
        </Text>
        {parentsSubtitle ? <Text style={styles.generationSubtitle}>{parentsSubtitle}</Text> : null}

        <View style={[styles.parentsRow, isSingleParent && styles.parentsRowSingle]}>
          {unit.father ? (
            <View style={isSingleParent ? styles.singleParentCardWrap : styles.parentCardWrap}>
              <FamilyTreeCard
                relative={unit.father}
                compact
                onPress={() => onOpenRelative(unit.father!.id)}
              />
            </View>
          ) : null}

          {isCouple && unit.father && unit.mother ? (
            <View style={styles.marriageLink}>
              <Text style={styles.marriageIcon}>♥</Text>
            </View>
          ) : null}

          {unit.mother ? (
            <View style={isSingleParent ? styles.singleParentCardWrap : styles.parentCardWrap}>
              <FamilyTreeCard
                relative={unit.mother}
                compact
                onPress={() => onOpenRelative(unit.mother!.id)}
              />
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.connector}>
        <View style={styles.line} />
        <View style={styles.connectorBadge}>
          <Text style={styles.connectorIcon}>↓</Text>
        </View>
        <View style={styles.line} />
      </View>

      <View style={styles.childrenSection}>
        <View style={styles.childrenHeader}>
          <Text style={styles.generationTitle}>Балалар · Children</Text>
          <Text style={styles.childrenCount}>{childrenCountLabel}</Text>
        </View>

        {hasChildren ? (
          <>
            {childLayout.compact ? (
              <Text style={styles.compactHint}>
                Компактты көрініс · Compact ({COMPACT_CHILDREN_THRESHOLD}+)
              </Text>
            ) : null}

            <View style={[styles.childrenRow, childLayout.compact && styles.childrenRowCompact]}>
              {unit.children.map((child) => (
                <FamilyTreeCard
                  key={child.id}
                  relative={child}
                  compact={childLayout.compact}
                  mini={childLayout.mini}
                  gridItem={childLayout.gridItem}
                  onPress={() => onOpenRelative(child.id)}
                />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.childrenEmpty}>
            <Text style={styles.childrenEmptyText}>
              Бала қосу үшін төмендегі батырманы басыңыз
            </Text>
          </View>
        )}

        <Pressable
          onPress={() => onAddChild(unit)}
          style={({ pressed }) => [styles.addChildButton, pressed && styles.addChildPressed]}
          accessibilityRole="button"
          accessibilityLabel="Баланы қосу · Add child">
          <Text style={styles.addChildIcon}>+</Text>
          <Text style={styles.addChildText}>Баланы қосу · Add child</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  parentsSection: {
    gap: Spacing.sm,
    backgroundColor: '#F4EFE4',
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.goldLight,
  },
  parentsSectionSingle: {
    alignItems: 'stretch',
  },
  generationTitle: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  generationSubtitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  parentsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  parentsRowSingle: {
    justifyContent: 'center',
  },
  parentCardWrap: {
    flex: 1,
    minWidth: 0,
  },
  singleParentCardWrap: {
    width: '100%',
    maxWidth: 220,
    alignSelf: 'center',
  },
  marriageLink: {
    alignSelf: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marriageIcon: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
    fontSize: 11,
  },
  connector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  line: {
    flex: 1,
    height: 1.5,
    backgroundColor: Palette.goldLight,
    borderRadius: 1,
  },
  connectorBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectorIcon: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '700',
    lineHeight: 14,
  },
  childrenSection: {
    gap: Spacing.sm,
  },
  childrenHeader: {
    gap: 2,
    alignItems: 'center',
  },
  childrenCount: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  compactHint: {
    ...Typography.caption,
    color: Palette.textMuted,
    textAlign: 'center',
  },
  childrenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  childrenRowCompact: {
    justifyContent: 'space-between',
    rowGap: Spacing.sm,
  },
  childrenEmpty: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.cream,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  childrenEmptyText: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  addChildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 48,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.greenDeep,
    borderStyle: 'dashed',
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.md,
  },
  addChildPressed: {
    opacity: 0.92,
    backgroundColor: '#F4FAF6',
  },
  addChildIcon: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  addChildText: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
});
