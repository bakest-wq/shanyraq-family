import { Alert, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TEST_FAMILY_SEED_DRAFTS, TEST_FAMILY_SEED_LABELS } from '@/constants/test-family-seed';
import { useTestFamilySeed } from '@/hooks/useTestFamilySeed';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

export function DevTestFamilyTools() {
  const { hasSeed, busy, error, seedTestFamily, clearTestFamily } = useTestFamilySeed();

  const handleSeed = () => {
    Alert.alert(
      'Тест отбасы · Dev only',
      hasSeed
        ? 'Бар test деректер ауыстырылады. Нақты туысқандарға тимейді.'
        : '10 test tuys qosu — shezhire, birthdays, suggestions test.',
      [
        { text: 'Болдырмау', style: 'cancel' },
        {
          text: 'Құру',
          onPress: () => {
            void (async () => {
              try {
                const result = await seedTestFamily();
                if (!result) {
                  return;
                }

                Alert.alert(
                  'Дайын 🌿',
                  `${result.created} test tuys qосылды.${result.replaced ? ` (${result.replaced} eski test almashtyryldy)` : ''}`,
                );
              } catch (err) {
                Alert.alert(
                  'Қате',
                  err instanceof Error ? err.message : 'Тест отбасын құру сәтсіз аяқталды.',
                );
              }
            })();
          },
        },
      ],
    );
  };

  const handleClear = () => {
    if (!hasSeed) {
      Alert.alert('Test дерек жоқ', 'Алдымен test отбасын құрыңыз.');
      return;
    }

    Alert.alert(
      'Тест деректерін тазарту',
      'Тек dev test tuystary жойылады. Нақты деректерге тимейді.',
      [
        { text: 'Болдырмау', style: 'cancel' },
        {
          text: 'Тазарту',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                const result = await clearTestFamily();
                if (!result) {
                  return;
                }

                Alert.alert(
                  'Тазартылды',
                  `${result.removed} test tuys жойылды.${result.unlinked ? ` ${result.unlinked} real link tazartyldy.` : ''}`,
                );
              } catch (err) {
                Alert.alert(
                  'Қате',
                  err instanceof Error ? err.message : 'Тест деректерін тазарту сәтсіз аяқталды.',
                );
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <Card style={styles.card}>
      <View style={styles.devBadgeRow}>
        <Text style={styles.devBadge}>DEV</Text>
        <Text style={styles.devHint}>Development only · production hide</Text>
      </View>

      <Text style={styles.sectionLabel}>Seed Test Family</Text>
      <Text style={styles.intro}>
        Жылдам test отбасы: шежіре, туған күндер, туыстық және ұсыныстарды тексеруге.
      </Text>

      <View style={styles.memberList}>
        {TEST_FAMILY_SEED_DRAFTS.map((draft) => (
          <Text key={draft.key} style={styles.memberChip}>
            {TEST_FAMILY_SEED_LABELS[draft.key]} · {draft.input.displayName ?? draft.input.firstName}
          </Text>
        ))}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <PrimaryButton
        label={busy ? 'Дайындалуда...' : 'Тест отбасы құру · Create test family'}
        sublabel={hasSeed ? 'Replace existing test seed · test almashtyrady' : '10 relatives · links + ru'}
        variant="green"
        onPress={busy ? undefined : handleSeed}
      />

      <PrimaryButton
        label="Тест деректерін тазарту · Clear test data"
        sublabel={hasSeed ? 'Only tracked test relatives' : 'Test seed joq'}
        variant="danger"
        onPress={busy ? undefined : handleClear}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: Palette.textMuted,
    backgroundColor: '#F7F4EE',
  },
  devBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  devBadge: {
    ...Typography.caption,
    color: Palette.white,
    backgroundColor: Palette.textMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    fontWeight: '800',
  },
  devHint: {
    ...Typography.caption,
    color: Palette.textMuted,
    flex: 1,
  },
  sectionLabel: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  intro: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    lineHeight: 22,
  },
  memberList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  memberChip: {
    ...Typography.caption,
    color: Palette.greenDeep,
    backgroundColor: Palette.white,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.goldLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  errorText: {
    ...Typography.caption,
    color: Palette.danger,
    fontWeight: '600',
  },
});
