import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ArchiveCategoryChips } from '@/components/archive/ArchiveCategoryChips';
import { PhotoPlaceholderUpload } from '@/components/archive/PhotoPlaceholderUpload';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Relative } from '@/types/relative';
import {
  ARCHIVE_CATEGORIES,
  ArchiveCategoryId,
  CreateMemoryInput,
} from '@/types/archive';
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

  return (
    <>
      <PhotoPlaceholderUpload
        hasPhoto={form.hasPhoto}
        onChange={(hasPhoto) => onChange('hasPhoto', hasPhoto)}
      />

      <FormField
        label="Атауы · Название *"
        placeholder="Мысалы: Наурыз 2024"
        value={form.title}
        onChangeText={(value) => onChange('title', value)}
        error={errors.title}
      />

      <Card goldBorder style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Туыс · Родственник *</Text>
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
          <Text style={styles.hint}>Сначала добавьте родственников в списке «Туыстар».</Text>
        ) : null}
        {errors.relativeName ? <Text style={styles.errorText}>{errors.relativeName}</Text> : null}
      </Card>

      <FormField
        label="Жыл · Год"
        placeholder="2024"
        value={form.year}
        onChangeText={(value) => onChange('year', value)}
        keyboardType="number-pad"
        error={errors.year}
        hint="Необязательно · Формат YYYY"
      />

      <View style={styles.storyField}>
        <Text style={styles.sectionLabel}>Тарих · История *</Text>
        <TextInput
          placeholder="Короткая семейная история..."
          placeholderTextColor={Palette.textMuted}
          value={form.story}
          onChangeText={(value) => onChange('story', value)}
          multiline
          textAlignVertical="top"
          style={[styles.storyInput, errors.story ? styles.storyInputError : null]}
        />
        {errors.story ? <Text style={styles.errorText}>{errors.story}</Text> : null}
      </View>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Санат · Категория</Text>
        <ArchiveCategoryChips
          options={ARCHIVE_CATEGORIES}
          value={form.category}
          onChange={(value) => onChange('category', value as ArchiveCategoryId)}
        />
      </Card>

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
    minHeight: 56,
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
  relativeChipRole: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  relativeChipRoleSelected: {
    color: Palette.goldLight,
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
  },
  storyInputError: {
    borderColor: Palette.danger,
  },
  hint: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  errorText: {
    ...Typography.caption,
    color: Palette.danger,
    fontWeight: '600',
  },
});
