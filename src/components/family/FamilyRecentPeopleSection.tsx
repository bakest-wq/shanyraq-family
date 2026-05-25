import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { FamilySearchResultRow } from '@/components/family/FamilySearchResultRow';
import { FAMILY_SEARCH_COPY } from '@/constants/family-search-content';
import { Relative } from '@/types/relative';
import { Palette, Spacing, Typography } from '@/constants/theme';

type FamilyRecentPeopleSectionProps = {
  people: Relative[];
  kinshipLabels: ReadonlyMap<string, string>;
  onOpenRelative?: (relativeId: string) => void;
};

export function FamilyRecentPeopleSection({
  people,
  kinshipLabels,
  onOpenRelative,
}: FamilyRecentPeopleSectionProps) {
  if (people.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>{FAMILY_SEARCH_COPY.recentTitle}</Text>
        <Text style={styles.hint}>{FAMILY_SEARCH_COPY.recentHint}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        {people.map((relative) => (
          <View key={relative.id} style={styles.item}>
            <FamilySearchResultRow
              relative={relative}
              kinshipLabel={kinshipLabels.get(relative.id)}
              onPress={() => onOpenRelative?.(relative.id)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
  },
  header: {
    gap: 2,
  },
  title: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '800',
  },
  hint: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  list: {
    gap: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  item: {
    width: 280,
  },
});
