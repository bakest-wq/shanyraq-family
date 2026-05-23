import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RuPickerModal } from '@/components/relatives/RuPickerModal';
import { FormField } from '@/components/ui/FormField';
import {
  formatRuSelectionSummary,
  hasRuSelection,
  matchesDictionarySelection,
  RuSelection,
} from '@/utils/ru-dictionary';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type RuPickerProps = {
  zhuz?: string;
  ru?: string;
  tribeBranch?: string;
  ataLine?: string;
  onChange: (patch: Partial<RuSelection>) => void;
};

export function RuPicker({ zhuz = '', ru = '', tribeBranch = '', ataLine = '', onChange }: RuPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  const selection = useMemo(
    (): RuSelection => ({
      zhuz,
      ru,
      tribeBranch,
      ataLine,
    }),
    [zhuz, ru, tribeBranch, ataLine],
  );

  const hasSelection = hasRuSelection(selection);
  const summary = formatRuSelectionSummary(selection);
  const isDictionaryMatch = matchesDictionarySelection(selection);

  const openPicker = () => {
    setManualMode(false);
    setModalVisible(true);
  };

  const handleDictionarySelect = (next: RuSelection) => {
    setManualMode(false);
    onChange(next);
  };

  const handleManual = () => {
    setManualMode(true);
  };

  const handleClear = () => {
    setManualMode(false);
    onChange({
      zhuz: '',
      ru: '',
      tribeBranch: '',
      ataLine: '',
    });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.summaryCard}>
        <Text style={[styles.summaryText, !hasSelection && styles.summaryTextEmpty]} numberOfLines={3}>
          {summary}
        </Text>
        {hasSelection && isDictionaryMatch ? (
          <Text style={styles.summaryMeta}>Анықтамалықтан · Из справочника</Text>
        ) : hasSelection && manualMode ? (
          <Text style={styles.summaryMeta}>Қолмен · Вручную</Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={openPicker}
          style={({ pressed }) => [styles.actionButton, styles.selectButton, pressed && styles.pressed]}
          accessibilityRole="button">
          <Text style={styles.selectButtonText}>Ру таңдау · Выбрать ру</Text>
        </Pressable>

        {hasSelection ? (
          <Pressable
            onPress={handleClear}
            style={({ pressed }) => [styles.actionButton, styles.clearButton, pressed && styles.pressed]}
            accessibilityRole="button">
            <Text style={styles.clearButtonText}>Тазарту · Очистить</Text>
          </Pressable>
        ) : null}
      </View>

      {manualMode || (hasSelection && !isDictionaryMatch) ? (
        <View style={styles.manualFields}>
          <Text style={styles.manualHint}>Тізімде жоқ · Нет в списке — қолмен толтырыңыз</Text>
          <FormField
            label="Жүз · Zhuz"
            placeholder="Мысалы: Орта жүз"
            value={zhuz}
            onChangeText={(value) => onChange({ zhuz: value })}
            autoCapitalize="words"
          />
          <FormField
            label="Ру · Ru"
            placeholder="Мысалы: Аргын"
            value={ru}
            onChangeText={(value) => onChange({ ru: value })}
            autoCapitalize="words"
          />
          <FormField
            label="Тармақ · Branch"
            placeholder="Мысалы: Торғай"
            value={tribeBranch}
            onChangeText={(value) => onChange({ tribeBranch: value })}
            autoCapitalize="words"
          />
          <FormField
            label="Ата тегі · Ata line"
            placeholder="Мысалы: Қантық"
            value={ataLine}
            onChangeText={(value) => onChange({ ataLine: value })}
            autoCapitalize="words"
          />
        </View>
      ) : null}

      <RuPickerModal
        visible={modalVisible}
        initialSelection={selection}
        onSelect={handleDictionarySelect}
        onManual={handleManual}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.md,
  },
  summaryCard: {
    minHeight: 72,
    backgroundColor: Palette.white,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    gap: 4,
  },
  summaryText: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
    lineHeight: 24,
  },
  summaryTextEmpty: {
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  summaryMeta: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionButton: {
    minHeight: 52,
    minWidth: 148,
    flexGrow: 1,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  selectButton: {
    backgroundColor: Palette.greenDeep,
  },
  clearButton: {
    backgroundColor: Palette.cream,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
  },
  pressed: {
    opacity: 0.9,
  },
  selectButtonText: {
    ...Typography.bodySmall,
    color: Palette.white,
    fontWeight: '700',
    textAlign: 'center',
  },
  clearButtonText: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  manualFields: {
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  manualHint: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
