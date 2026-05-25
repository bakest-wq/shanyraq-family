import { StyleSheet, Text, View } from 'react-native';

import { Relative } from '@/types/relative';
import { findRelativeById } from '@/utils/family-link-picker';
import { getEffectiveSpouse } from '@/utils/relationship-engine';

import { RelativeProfileLinkRow } from './RelativeProfileLinkRow';
import { RelativeProfileSection } from './RelativeProfileSection';
import { HelperHintBanner } from '@/components/ui/HelperHintBanner';
import { EMPTY_STATE_COPY } from '@/constants/empty-state-content';
import { SHEZHIRE_NAME_WARNING } from '@/constants/family-ux-content';
import { Palette, Spacing, Typography } from '@/constants/theme';

type RelativeProfileFamilySectionProps = {
  relative: Relative;
  relatives: Relative[];
  children: Relative[];
  onOpenRelative: (relativeId: string) => void;
};

export function RelativeProfileFamilySection({
  relative,
  relatives,
  children,
  onOpenRelative,
}: RelativeProfileFamilySectionProps) {
  const father = findRelativeById(relatives, relative.fatherId);
  const mother = findRelativeById(relatives, relative.motherId);
  const spouse = getEffectiveSpouse(relative, relatives);

  return (
    <RelativeProfileSection
      title="Отбасы байланысы · Семья"
      subtitle="Әke, ana, жұбай және балалар">
      <HelperHintBanner text={SHEZHIRE_NAME_WARNING} />
      <RelativeProfileLinkRow
        label="Әke · Отец"
        relative={father}
        emptyLabel="Көрсетілмеген · Не указан"
        onPress={onOpenRelative}
      />
      <RelativeProfileLinkRow
        label="Аna · Мать"
        relative={mother}
        emptyLabel="Көрсетілмеген · Не указана"
        onPress={onOpenRelative}
      />
      <RelativeProfileLinkRow
        label="Жұбай · Супруг(а)"
        relative={spouse}
        emptyLabel="Көрсетілмеген · Не указан(а)"
        onPress={onOpenRelative}
      />

      <View style={styles.childrenHeader}>
        <Text style={styles.childrenTitle}>Балалар · Дети</Text>
      </View>

      {children.length === 0 ? (
        <View style={styles.childrenEmpty}>
          <Text style={styles.childrenEmptyText}>{EMPTY_STATE_COPY.children.title}</Text>
        </View>
      ) : (
        children.map((child, index) => (
          <RelativeProfileLinkRow
            key={child.id}
            label={`${index + 1}-бала · Ребёнок ${index + 1}`}
            relative={child}
            emptyLabel=""
            onPress={onOpenRelative}
            isLast={index === children.length - 1}
          />
        ))
      )}
    </RelativeProfileSection>
  );
}

const styles = StyleSheet.create({
  childrenHeader: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Palette.creamDark,
  },
  childrenTitle: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  childrenEmpty: {
    minHeight: 56,
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  childrenEmptyText: {
    ...Typography.bodySmall,
    color: Palette.textMuted,
    fontWeight: '600',
  },
});
