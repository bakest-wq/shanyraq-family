import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SearchField } from '@/components/ui/SearchField';
import {
  formatSearchResultLabel,
  formatSearchResultSubtitle,
  getStepOptions,
  getStepTitle,
  recordToSelection,
  RuPickerStep,
  RuSelection,
  searchRuDictionary,
} from '@/utils/ru-dictionary';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type RuPickerModalProps = {
  visible: boolean;
  initialSelection: Partial<RuSelection>;
  onSelect: (selection: RuSelection) => void;
  onManual: () => void;
  onClose: () => void;
};

const STEPS: RuPickerStep[] = ['zhuz', 'ru', 'branch', 'ataLine'];

export function RuPickerModal({
  visible,
  initialSelection,
  onSelect,
  onManual,
  onClose,
}: RuPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState<RuPickerStep>('zhuz');
  const [draft, setDraft] = useState<Partial<RuSelection>>({});

  useEffect(() => {
    if (!visible) {
      return;
    }

    setSearchQuery('');
    setStep('zhuz');
    setDraft({
      zhuz: initialSelection.zhuz ?? '',
      ru: initialSelection.ru ?? '',
      tribeBranch: initialSelection.tribeBranch ?? '',
      ataLine: initialSelection.ataLine ?? '',
    });
  }, [visible, initialSelection]);

  const searchResults = useMemo(
    () => searchRuDictionary(searchQuery),
    [searchQuery],
  );

  const stepOptions = useMemo(() => getStepOptions(step, draft), [step, draft]);
  const isSearching = searchQuery.trim().length > 0;

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const handleSelectRecord = (record: ReturnType<typeof searchRuDictionary>[number]) => {
    onSelect(recordToSelection(record));
    handleClose();
  };

  const handleSelectOption = (value: string) => {
    if (step === 'zhuz') {
      setDraft({ zhuz: value });
      setStep('ru');
      return;
    }

    if (step === 'ru') {
      setDraft((current) => ({ ...current, ru: value }));
      setStep('branch');
      return;
    }

    if (step === 'branch') {
      setDraft((current) => ({ ...current, tribeBranch: value }));
      setStep('ataLine');
      return;
    }

    const nextSelection: RuSelection = {
      zhuz: draft.zhuz ?? '',
      ru: draft.ru ?? '',
      tribeBranch: draft.tribeBranch ?? '',
      ataLine: value,
    };

    onSelect(nextSelection);
    handleClose();
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex <= 0) {
      return;
    }

    setStep(STEPS[currentIndex - 1]);
  };

  const handleManual = () => {
    onManual();
    handleClose();
  };

  const selectedValue =
    step === 'zhuz'
      ? draft.zhuz
      : step === 'ru'
        ? draft.ru
        : step === 'branch'
          ? draft.tribeBranch
          : draft.ataLine;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Ру анықтамалығы · Справочник ру</Text>
          <Text style={styles.subtitle}>Руыңызды іздеңіз · Найдите свой ру</Text>

          <SearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Руыңызды іздеңіз · Найдите свой ру"
          />

          {!isSearching ? (
            <>
              <View style={styles.stepHeader}>
                {step !== 'zhuz' ? (
                  <Pressable onPress={handleBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Артқа</Text>
                  </Pressable>
                ) : (
                  <View style={styles.backSpacer} />
                )}
                <Text style={styles.stepTitle}>{getStepTitle(step)}</Text>
              </View>

              <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
                {stepOptions.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>Тізім бос</Text>
                    <Text style={styles.emptyText}>
                      Алдыңы қадамды таңдаңыз · Сначала выберите предыдущий шаг
                    </Text>
                  </View>
                ) : (
                  stepOptions.map((option) => {
                    const selected = selectedValue === option.value;

                    return (
                      <Pressable
                        key={`${step}-${option.value}`}
                        onPress={() => handleSelectOption(option.value)}
                        style={({ pressed }) => [
                          styles.option,
                          selected && styles.optionSelected,
                          pressed && styles.optionPressed,
                        ]}>
                        <Text
                          style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                          {option.labelKz}
                        </Text>
                        <Text
                          style={[
                            styles.optionSubtitle,
                            selected && styles.optionSubtitleSelected,
                          ]}>
                          {option.labelRu}
                        </Text>
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>
            </>
          ) : (
            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              {searchResults.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>Табылмады</Text>
                  <Text style={styles.emptyText}>
                    Басқа сөзді жазыңыз · Попробуйте другой запрос
                  </Text>
                </View>
              ) : (
                searchResults.map((record) => (
                  <Pressable
                    key={record.id}
                    onPress={() => handleSelectRecord(record)}
                    style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}>
                    <Text style={styles.optionLabel}>{formatSearchResultLabel(record)}</Text>
                    <Text style={styles.optionSubtitle}>
                      {formatSearchResultSubtitle(record)}
                    </Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
          )}

          <Pressable
            onPress={handleManual}
            style={({ pressed }) => [styles.manualButton, pressed && styles.optionPressed]}>
            <Text style={styles.manualButtonText}>Тізімде жоқ · Нет в списке</Text>
          </Pressable>

          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Жабу · Закрыть</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    padding: Spacing.lg,
  },
  card: {
    maxHeight: '90%',
    backgroundColor: Palette.cream,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.card,
  },
  title: {
    ...Typography.title,
    color: Palette.greenDeep,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
  stepHeader: {
    gap: Spacing.xs,
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  backSpacer: {
    height: 44,
  },
  backButtonText: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  stepTitle: {
    ...Typography.bodySmall,
    color: Palette.gold,
    fontWeight: '700',
    textAlign: 'center',
  },
  list: {
    maxHeight: 360,
  },
  option: {
    minHeight: 64,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    gap: 2,
    marginBottom: Spacing.sm,
  },
  optionSelected: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.gold,
  },
  optionPressed: {
    opacity: 0.92,
  },
  optionLabel: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  optionLabelSelected: {
    color: Palette.white,
  },
  optionSubtitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  optionSubtitleSelected: {
    color: Palette.goldLight,
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  emptyTitle: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  manualButton: {
    minHeight: 52,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.goldLight,
    backgroundColor: '#F4EFE4',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  manualButtonText: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
    textAlign: 'center',
  },
  closeButton: {
    minHeight: 52,
    borderRadius: Radius.md,
    backgroundColor: Palette.greenDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    ...Typography.bodySmall,
    color: Palette.white,
    fontWeight: '700',
  },
});
