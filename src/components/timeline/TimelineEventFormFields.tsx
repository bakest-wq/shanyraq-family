import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { TimelineEventTypeChips } from '@/components/timeline/TimelineEventTypeChips';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Relative } from '@/types/relative';
import { CreateTimelineEventInput, TIMELINE_EVENT_TYPES } from '@/types/timeline';
import { TimelineFormErrors } from '@/utils/timeline-validation';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type TimelineEventFormFieldsProps = {
  form: CreateTimelineEventInput;
  errors: TimelineFormErrors;
  saveError?: string | null;
  relatives: Relative[];
  onChange: <K extends keyof CreateTimelineEventInput>(
    key: K,
    value: CreateTimelineEventInput[K],
  ) => void;
};

export function TimelineEventFormFields({
  form,
  errors,
  saveError,
  relatives,
  onChange,
}: TimelineEventFormFieldsProps) {
  const toggleRelative = (relative: Relative) => {
    const selected = form.relativeIds.includes(relative.id);

    if (selected) {
      const nextIds = form.relativeIds.filter((id) => id !== relative.id);
      onChange('relativeIds', nextIds);
      onChange(
        'relativeNames',
        nextIds
          .map((id) => relatives.find((item) => item.id === id)?.fullName ?? '')
          .filter(Boolean),
      );
      return;
    }

    onChange('relativeIds', [...form.relativeIds, relative.id]);
    onChange('relativeNames', [...form.relativeNames, relative.fullName]);
  };

  return (
    <>
      <Card goldBorder style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Оқиға түрі · Тип события</Text>
        <TimelineEventTypeChips
          options={TIMELINE_EVENT_TYPES.filter(
            (option) => option.id !== 'birth' && option.id !== 'death',
          )}
          value={form.type}
          onChange={(type) => onChange('type', type)}
        />
        <Text style={styles.hint}>
          Туған күн, үйлену және қайтыс болу оқиғалары туыстардан автоматты түрде
          қосылады.
        </Text>
      </Card>

      <FormField
        label="Атауы · Название *"
        placeholder="Мысалы: Алматыға көшу"
        value={form.title}
        onChangeText={(value) => onChange('title', value)}
        error={errors.title}
      />

      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <FormField
            label="Жыл · Год"
            placeholder="1998"
            value={form.year}
            onChangeText={(value) => onChange('year', value)}
            keyboardType="number-pad"
            error={errors.year}
          />
        </View>
        <View style={styles.dateField}>
          <FormField
            label="Ай"
            placeholder="5"
            value={form.month ?? ''}
            onChangeText={(value) => onChange('month', value)}
            keyboardType="number-pad"
            error={errors.month}
          />
        </View>
        <View style={styles.dateField}>
          <FormField
            label="Күн"
            placeholder="12"
            value={form.day ?? ''}
            onChangeText={(value) => onChange('day', value)}
            keyboardType="number-pad"
            error={errors.day}
          />
        </View>
      </View>

      <Card goldBorder style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Туыс · Родственники</Text>
        <View style={styles.relativeGrid}>
          {relatives.map((relative) => {
            const selected = form.relativeIds.includes(relative.id);

            return (
              <Pressable
                key={relative.id}
                onPress={() => toggleRelative(relative)}
                style={({ pressed }) => [
                  styles.relativeChip,
                  selected && styles.relativeChipSelected,
                  pressed && styles.relativeChipPressed,
                ]}>
                <Text
                  style={[
                    styles.relativeChipText,
                    selected && styles.relativeChipTextSelected,
                  ]}
                  numberOfLines={2}>
                  {relative.fullName}
                </Text>
                <Text
                  style={[
                    styles.relativeChipRole,
                    selected && styles.relativeChipRoleSelected,
                  ]}>
                  {relative.relationship}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {relatives.length === 0 ? (
          <Text style={styles.hint}>Алдымен «Туыстар» тізіміне туыс қосыңыз.</Text>
        ) : null}
      </Card>

      <View style={styles.storyField}>
        <Text style={styles.sectionLabel}>Сипаттама · Описание</Text>
        <TextInput
          placeholder="Отбасы тарихындағы қысқа естелік..."
          placeholderTextColor={Palette.textMuted}
          value={form.description}
          onChangeText={(value) => onChange('description', value)}
          multiline
          textAlignVertical="top"
          style={[styles.storyInput, errors.description ? styles.storyInputError : null]}
        />
        {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
      </View>

      {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  hint: {
    ...Typography.caption,
    color: Palette.textSecondary,
    lineHeight: 18,
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dateField: {
    flex: 1,
  },
  relativeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  relativeChip: {
    minWidth: '47%',
    flexGrow: 1,
    backgroundColor: Palette.cream,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    padding: Spacing.sm,
    gap: 2,
  },
  relativeChipSelected: {
    borderColor: Palette.gold,
    backgroundColor: '#FFF9EB',
  },
  relativeChipPressed: {
    opacity: 0.92,
  },
  relativeChipText: {
    ...Typography.caption,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  relativeChipTextSelected: {
    color: Palette.greenDeep,
  },
  relativeChipRole: {
    ...Typography.caption,
    color: Palette.textMuted,
    fontSize: 11,
  },
  relativeChipRoleSelected: {
    color: Palette.textSecondary,
  },
  storyField: {
    gap: Spacing.sm,
  },
  storyInput: {
    minHeight: 120,
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    padding: Spacing.md,
    ...Typography.body,
    color: Palette.textPrimary,
  },
  storyInputError: {
    borderColor: Palette.danger,
  },
  errorText: {
    ...Typography.caption,
    color: Palette.danger,
    fontWeight: '600',
  },
});
