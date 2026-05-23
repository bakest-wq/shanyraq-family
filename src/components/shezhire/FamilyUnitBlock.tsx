import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { FamilyTreeCard } from '@/components/shezhire/FamilyTreeCard';
import { Card } from '@/components/ui/Card';
import { FamilyUnit } from '@/utils/family-tree';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type FamilyUnitBlockProps = {
  unit: FamilyUnit;
};

export function FamilyUnitBlock({ unit }: FamilyUnitBlockProps) {
  const router = useRouter();

  const openRelative = (id: string) => {
    router.push({
      pathname: '/relative/[id]',
      params: { id },
    });
  };

  const isSingleParent = unit.layout !== 'couple';
  const parentsLabel =
    unit.layout === 'couple'
      ? 'Отбасы · Супруги'
      : unit.father
        ? getRelativeDisplayName(unit.father)
        : unit.mother
          ? getRelativeDisplayName(unit.mother)
          : 'Отбасы';
  const childLabel =
    unit.children.length === 1
      ? '1 бала · 1 ребёнок'
      : `${unit.children.length} бала · ${unit.children.length} детей`;

  return (
    <Card goldBorder style={styles.block}>
      <View style={[styles.parentsSection, isSingleParent && styles.parentsSectionSingle]}>
        <Text style={styles.parentsLabel}>{parentsLabel}</Text>

        <View style={[styles.parentsRow, isSingleParent && styles.parentsRowSingle]}>
          {unit.father ? (
            <View style={isSingleParent ? styles.singleParentCardWrap : styles.parentCardWrap}>
              <FamilyTreeCard
                relative={unit.father}
                compact
                onPress={() => openRelative(unit.father!.id)}
              />
            </View>
          ) : null}
          {unit.layout === 'couple' && unit.father && unit.mother ? (
            <View style={styles.marriageLink}>
              <Text style={styles.marriageIcon}>♥</Text>
            </View>
          ) : null}
          {unit.mother ? (
            <View style={isSingleParent ? styles.singleParentCardWrap : styles.parentCardWrap}>
              <FamilyTreeCard
                relative={unit.mother}
                compact
                onPress={() => openRelative(unit.mother!.id)}
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
        <Text style={styles.childrenLabel}>{childLabel}</Text>
        <View style={styles.childrenRow}>
          {unit.children.map((child) => (
            <FamilyTreeCard
              key={child.id}
              relative={child}
              onPress={() => openRelative(child.id)}
            />
          ))}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  parentsSection: {
    gap: Spacing.sm,
    backgroundColor: Palette.cream,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.goldLight,
  },
  parentsSectionSingle: {
    alignItems: 'stretch',
  },
  parentsLabel: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  parentsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.sm,
  },
  parentsRowSingle: {
    justifyContent: 'center',
  },
  parentCardWrap: {
    flex: 1,
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
  },
  connector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: Palette.goldLight,
    borderRadius: 1,
  },
  connectorBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.white,
    borderWidth: 1.5,
    borderColor: Palette.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectorIcon: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
    lineHeight: 16,
  },
  childrenSection: {
    gap: Spacing.sm,
  },
  childrenLabel: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '700',
    textAlign: 'center',
  },
  childrenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
});
