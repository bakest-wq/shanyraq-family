import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { FamilyTreeCard } from '@/components/shezhire/FamilyTreeCard';
import { Card } from '@/components/ui/Card';
import { FamilyUnit } from '@/utils/family-tree';
import { Palette, Spacing, Typography } from '@/constants/theme';

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

  return (
    <Card goldBorder style={styles.block}>
      <View style={styles.parentsRow}>
        {unit.father ? (
          <FamilyTreeCard
            relative={unit.father}
            compact
            onPress={() => openRelative(unit.father!.id)}
          />
        ) : (
          <FamilyTreeCard placeholder placeholderLabel="Әke · Отец" compact />
        )}
        {unit.mother ? (
          <FamilyTreeCard
            relative={unit.mother}
            compact
            onPress={() => openRelative(unit.mother!.id)}
          />
        ) : (
          <FamilyTreeCard placeholder placeholderLabel="Ана · Мать" compact />
        )}
      </View>

      <View style={styles.connector}>
        <View style={styles.line} />
        <Text style={styles.connectorIcon}>↓</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.childrenRow}>
        {unit.children.map((child) => (
          <FamilyTreeCard
            key={child.id}
            relative={child}
            onPress={() => openRelative(child.id)}
          />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.md,
  },
  parentsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  connector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: Palette.goldLight,
    borderRadius: 1,
  },
  connectorIcon: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  childrenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
