import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ArchiveCategoryChips } from '@/components/archive/ArchiveCategoryChips';
import { MemoryPhotoPicker } from '@/components/archive/MemoryPhotoPicker';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { FAMILY_MEMORIES_COPY } from '@/constants/family-memories-content';
import { Relative } from '@/types/relative';
import { CreateMemoryInput, MEMORY_TYPES, MemoryType } from '@/types/archive';
import { MemoryFormErrors } from '@/utils/archive-validation';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type MemoryFormFieldsProps = {
  form: CreateMemoryInput;
  errors: MemoryFormErrors;
  saveError?: string | null;
  relatives: Relative[];
  onChange: <K extends keyof CreateMemoryInput>(
    key: K,
    value: CreateMemoryInput[K],
  ) => void;
};

function storyPlaceholder(category: MemoryType): string {
  if (category === 'note') {
    return FAMILY_MEMORIES_COPY.form.storyPlaceholderNote;
  }

  if (category === 'photo') {
    return FAMILY_MEMORIES_COPY.form.storyPlaceholderPhoto;
  }

  return FAMILY_MEMORIES_COPY.form.storyPlaceholderStory;
}

export function MemoryFormFields({
  form,
  errors,
  saveError,
  relatives,
  onChange,
}: MemoryFormFieldsProps) {
  const selectRelative = (relative: Relative) => {
    onChange('relativeId', relative.id);
    onChange('relativeName', relative.fullName);
  };

  const handleTypeChange = (type: MemoryType) => {
    onChange('category', type);
    if (type !== 'photo') {
      onChange('pendingPhotoUri', null);
    }
  };

  const storyRequired = form.category !== 'photo';

  return (
    <>
      <Card goldBorder style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>{FAMILY_MEMORIES_COPY.form.type}</Text>
        <ArchiveCategoryChips
          options={MEMORY_TYPES.map((type) => ({
            id: type.id,
            label: `${type.icon} ${type.label}`,
          }))}
          value={form.category}
          onChange={(value) => handleTypeChange(value as MemoryType)}
        />
      </Card>

      <FormField
        label={`${FAMILY_MEMORIES_COPY.form.title} *`}
        placeholder={FAMILY_MEMORIES_COPY.form.titlePlaceholder}
        value={form.title}
        onChangeText={(value) => onChange('title', value)}
        error={errors.title}
      />

      <Card goldBorder style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>{FAMILY_MEMORIES_COPY.form.relative} *</Text>
        <View style={styles.relativeGrid}>
          {relatives.map((relative) => {
            const selected = form.relativeId === relative.id;
            return (
              <Pressable
                key={relative.id}
                onPress={() => selectRelative(relative)}
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
              </Pressable>
            );
          })}
        </View>
        {relatives.length === 0 ? (
          <Text style={styles.hint}>{FAMILY_MEMORIES_COPY.form.relativeEmpty}</Text>
        ) : null}
        {errors.relativeName ? <Text style={styles.errorText}>{errors.relativeName}</Text> : null}
      </Card>

      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <FormField
            label={FAMILY_MEMORIES_COPY.form.year}
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

      {form.category === 'photo' ? (
        <>
          <MemoryPhotoPicker
            photoUri={form.pendingPhotoUri}
            onChange={(uri) => onChange('pendingPhotoUri', uri)}
          />
          {errors.photo ? <Text style={styles.errorText}>{errors.photo}</Text> : null}
        </>
      ) : null}

      <View style={styles.storyField}>
        <Text style={styles.sectionLabel}>
          {FAMILY_MEMORIES_COPY.form.story}
          {storyRequired ? ' *' : ''}
        </Text>
        <TextInput
          placeholder={storyPlaceholder(form.category)}
          placeholderTextColor={Palette.textMuted}
          value={form.story}
          onChangeText={(value) => onChange('story', value)}
          multiline
          textAlignVertical="top"
          style={[styles.storyInput, errors.story ? styles.storyInputError : null]}
        />
        {errors.story ? <Text style={styles.errorText}>{errors.story}</Text> : null}
      </View>

      {form.category === 'story' ? (
        <MemoryPhotoPicker
          photoUri={form.pendingPhotoUri}
          onChange={(uri) => onChange('pendingPhotoUri', uri)}
        />
      ) : null}

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
    minHeight: 56,
    justifyContent: 'center',
  },
  relativeChipSelected: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.gold,
  },
  relativeChipPressed: {
    opacity: 0.9,
  },
  relativeChipText: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  relativeChipTextSelected: {
    color: Palette.white,
  },
  storyField: {
    gap: Spacing.sm,
  },
  storyInput: {
    ...Typography.body,
    backgroundColor: Palette.white,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Palette.textPrimary,
    minHeight: 140,
    lineHeight: 26,
  },
  storyInputError: {
    borderColor: Palette.danger,
  },
  hint: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    ...Typography.caption,
    color: Palette.danger,
    fontWeight: '600',
  },
});
