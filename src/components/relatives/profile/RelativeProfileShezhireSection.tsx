import { StyleSheet, Text, View } from 'react-native';

import { Relative } from '@/types/relative';
import { formatRuSelectionSummary, hasRuSelection } from '@/utils/ru-dictionary';

import { RelativeProfileInfoRow } from './RelativeProfileInfoRow';
import { RelativeProfileSection } from './RelativeProfileSection';
import { Palette, Spacing, Typography } from '@/constants/theme';

type RelativeProfileShezhireSectionProps = {
  relative: Relative;
};

export function RelativeProfileShezhireSection({ relative }: RelativeProfileShezhireSectionProps) {
  const selection = {
    zhuz: relative.zhuz,
    ru: relative.ru,
    tribeBranch: relative.tribeBranch,
    ataLine: relative.ataLine,
  };

  if (!hasRuSelection(selection)) {
    return (
      <RelativeProfileSection title="Шежіре · Род" subtitle="Жүз, ру, тармақ, ата тегі">
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>🌿</Text>
          <Text style={styles.emptyTitle}>Ру көрсетілмеген</Text>
          <Text style={styles.emptyText}>
            Ру не указан · можно добавить при редактировании профиля
          </Text>
        </View>
      </RelativeProfileSection>
    );
  }

  return (
    <RelativeProfileSection
      title="Шежіре · Род"
      subtitle={formatRuSelectionSummary(selection)}
      goldBorder>
      <RelativeProfileInfoRow
        icon="🏔️"
        label="Жүз · Zhuz"
        value={relative.zhuz?.trim() || '—'}
        empty={!relative.zhuz?.trim()}
      />
      <RelativeProfileInfoRow
        icon="🌾"
        label="Ру · Ru"
        value={relative.ru?.trim() || '—'}
        empty={!relative.ru?.trim()}
      />
      <RelativeProfileInfoRow
        icon="🌿"
        label="Тармақ · Branch"
        value={relative.tribeBranch?.trim() || '—'}
        empty={!relative.tribeBranch?.trim()}
      />
      <RelativeProfileInfoRow
        icon="📜"
        label="Ата тегі · Ata line"
        value={relative.ataLine?.trim() || '—'}
        empty={!relative.ataLine?.trim()}
        isLast
      />
    </RelativeProfileSection>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyTitle: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
