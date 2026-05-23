import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CreateRelativeInput } from '@/types/relative';
import {
  BIRTHDAY_MONTH_OPTIONS,
  clampBirthdayDay,
  getBirthYearOptions,
  getDaysInMonth,
  syncBirthdayFields,
} from '@/utils/birthday-parts';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type BirthdayPickerProps = {
  day: number | null | undefined;
  month: number | null | undefined;
  year: number | null | undefined;
  yearUnknown: boolean;
  error?: string;
  onChange: (patch: Pick<
    CreateRelativeInput,
    'birthday' | 'birthdayDay' | 'birthdayMonth' | 'birthdayYear' | 'birthdayYearUnknown'
  >) => void;
};

type SelectField = 'day' | 'month' | 'year';

const PLACEHOLDER = '—';

export function BirthdayPicker({
  day,
  month,
  year,
  yearUnknown,
  error,
  onChange,
}: BirthdayPickerProps) {
  const [activeField, setActiveField] = useState<SelectField | null>(null);

  const yearOptions = useMemo(() => getBirthYearOptions(), []);
  const dayOptions = useMemo(() => {
    const maxDay = month ? getDaysInMonth(month, yearUnknown ? null : year) : 31;
    return Array.from({ length: maxDay }, (_, index) => index + 1);
  }, [month, year, yearUnknown]);

  const monthLabel = useMemo(() => {
    if (!month) {
      return PLACEHOLDER;
    }

    return BIRTHDAY_MONTH_OPTIONS.find((option) => option.value === month)?.label ?? PLACEHOLDER;
  }, [month]);

  const applyPatch = (
    patch: Partial<
      Pick<
        CreateRelativeInput,
        'birthdayDay' | 'birthdayMonth' | 'birthdayYear' | 'birthdayYearUnknown'
      >
    >,
  ) => {
    const synced = syncBirthdayFields({
      birthdayDay: day ?? null,
      birthdayMonth: month ?? null,
      birthdayYear: year ?? null,
      birthdayYearUnknown: yearUnknown,
      ...patch,
    });

    onChange({
      birthdayDay: synced.birthdayDay,
      birthdayMonth: synced.birthdayMonth,
      birthdayYear: synced.birthdayYear,
      birthdayYearUnknown: synced.birthdayYearUnknown,
      birthday: synced.birthday,
    });
  };

  const handleSelectDay = (nextDay: number) => {
    applyPatch({ birthdayDay: nextDay });
    setActiveField(null);
  };

  const handleSelectMonth = (nextMonth: number) => {
    const nextDay = day ? clampBirthdayDay(day, nextMonth, yearUnknown ? null : year) : day ?? null;
    applyPatch({ birthdayMonth: nextMonth, birthdayDay: nextDay });
    setActiveField(null);
  };

  const handleSelectYear = (nextYear: number) => {
    const nextDay =
      day && month ? clampBirthdayDay(day, month, nextYear) : day ?? null;
    applyPatch({
      birthdayYear: nextYear,
      birthdayYearUnknown: false,
      birthdayDay: nextDay,
    });
    setActiveField(null);
  };

  const toggleYearUnknown = () => {
    if (yearUnknown) {
      applyPatch({ birthdayYearUnknown: false });
      return;
    }

    applyPatch({ birthdayYearUnknown: true, birthdayYear: null });
  };

  const clearBirthday = () => {
    applyPatch({
      birthdayDay: null,
      birthdayMonth: null,
      birthdayYear: null,
      birthdayYearUnknown: false,
    });
  };

  const modalTitle =
    activeField === 'day'
      ? 'Күн · День'
      : activeField === 'month'
        ? 'Ай · Месяц'
        : activeField === 'year'
          ? 'Жыл · Год'
          : '';

  const modalOptions =
    activeField === 'day'
      ? dayOptions.map((value) => ({ value, label: String(value) }))
      : activeField === 'month'
        ? BIRTHDAY_MONTH_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))
        : activeField === 'year'
          ? yearOptions.map((value) => ({ value, label: String(value) }))
          : [];

  const selectedValue =
    activeField === 'day'
      ? day
      : activeField === 'month'
        ? month
        : activeField === 'year'
          ? year
          : null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Туған күні · Дата рождения</Text>
      <Text style={styles.hint}>Необязательно · Күн, ай және жылды таңдаңыз</Text>

      <View style={styles.row}>
        <SelectButton
          title="Күн · День"
          value={day ? String(day) : PLACEHOLDER}
          onPress={() => setActiveField('day')}
        />
        <SelectButton
          title="Ай · Месяц"
          value={monthLabel}
          onPress={() => setActiveField('month')}
          flex
        />
        <SelectButton
          title="Жыл · Год"
          value={yearUnknown ? '?' : year ? String(year) : PLACEHOLDER}
          onPress={() => !yearUnknown && setActiveField('year')}
          disabled={yearUnknown}
        />
      </View>

      <Pressable
        onPress={toggleYearUnknown}
        style={({ pressed }) => [
          styles.unknownToggle,
          yearUnknown && styles.unknownToggleSelected,
          pressed && styles.unknownTogglePressed,
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected: yearUnknown }}>
        <Text style={[styles.unknownToggleText, yearUnknown && styles.unknownToggleTextSelected]}>
          Жыл белгісіз · Год неизвестен
        </Text>
      </Pressable>

      {day || month || year ? (
        <Pressable onPress={clearBirthday} style={styles.clearButton}>
          <Text style={styles.clearText}>Тазалау · Очистить</Text>
        </Pressable>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={activeField !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveField(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setActiveField(null)}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
              {modalOptions.map((option) => {
                const selected = selectedValue === option.value;

                return (
                  <Pressable
                    key={`${activeField}-${option.value}`}
                    onPress={() => {
                      if (activeField === 'day') {
                        handleSelectDay(option.value as number);
                      } else if (activeField === 'month') {
                        handleSelectMonth(option.value as number);
                      } else if (activeField === 'year') {
                        handleSelectYear(option.value as number);
                      }
                    }}
                    style={({ pressed }) => [
                      styles.modalOption,
                      selected && styles.modalOptionSelected,
                      pressed && styles.modalOptionPressed,
                    ]}>
                    <Text
                      style={[
                        styles.modalOptionText,
                        selected && styles.modalOptionTextSelected,
                      ]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable onPress={() => setActiveField(null)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Жабу · Закрыть</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

type SelectButtonProps = {
  title: string;
  value: string;
  onPress: () => void;
  flex?: boolean;
  disabled?: boolean;
};

function SelectButton({ title, value, onPress, flex, disabled }: SelectButtonProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.selectButton,
        flex && styles.selectButtonFlex,
        disabled && styles.selectButtonDisabled,
        pressed && !disabled && styles.selectButtonPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}>
      <Text style={styles.selectTitle}>{title}</Text>
      <Text style={styles.selectValue} numberOfLines={2}>
        {value}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
  },
  label: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  hint: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  selectButton: {
    flex: 1,
    minHeight: 72,
    backgroundColor: Palette.white,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    gap: 2,
    ...Shadow.soft,
  },
  selectButtonFlex: {
    flex: 1.6,
  },
  selectButtonDisabled: {
    opacity: 0.55,
  },
  selectButtonPressed: {
    opacity: 0.92,
  },
  selectTitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  selectValue: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  unknownToggle: {
    minHeight: 56,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    backgroundColor: Palette.cream,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  unknownToggleSelected: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.gold,
  },
  unknownTogglePressed: {
    opacity: 0.92,
  },
  unknownToggleText: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  unknownToggleTextSelected: {
    color: Palette.white,
  },
  clearButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  clearText: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  errorText: {
    ...Typography.caption,
    color: Palette.danger,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    maxHeight: '78%',
    backgroundColor: Palette.cream,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.card,
  },
  modalTitle: {
    ...Typography.title,
    color: Palette.greenDeep,
    textAlign: 'center',
  },
  modalList: {
    maxHeight: 420,
  },
  modalOption: {
    minHeight: 56,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  modalOptionSelected: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.gold,
  },
  modalOptionPressed: {
    opacity: 0.92,
  },
  modalOptionText: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '600',
  },
  modalOptionTextSelected: {
    color: Palette.white,
  },
  modalClose: {
    minHeight: 52,
    borderRadius: Radius.md,
    backgroundColor: Palette.greenDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    ...Typography.bodySmall,
    color: Palette.white,
    fontWeight: '700',
  },
});
