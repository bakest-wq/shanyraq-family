import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ArchiveCategoryChips } from '@/components/archive/ArchiveCategoryChips';
import { PhotoPlaceholderUpload } from '@/components/archive/PhotoPlaceholderUpload';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
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
    onChange('hasVoice', type === 'voice');
    onChange('hasDocument', type === 'document');
    if (type !== 'photo') {
      onChange('hasPhoto', false);
    }
  };

  return (
    <>
      <Card goldBorder style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Түрі · Type</Text>
        <ArchiveCategoryChips
          options={MEMORY_TYPES.map((type) => ({
            id: type.id,
            label: `${type.icon} ${type.labelKz}`,
          }))}
          value={form.category}
          onChange={(value) => handleTypeChange(value as MemoryType)}
        />
      </Card>

      <FormField
        label="Атауы · Title *"
        placeholder="Мысалы: Ата-ананың насихаты"
        value={form.title}
        onChangeText={(value) => onChange('title', value)}
        error={errors.title}
      />

      <Card goldBorder style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Туыс · Relative *</Text>
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
          <Text style={styles.hint}>Алдымен «Туыстар» тізіміне туыс қосыңыз.</Text>
        ) : null}
        {errors.relativeName ? <Text style={styles.errorText}>{errors.relativeName}</Text> : null}
      </Card>

      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <FormField
            label="Жыл · Year"
            placeholder="1998"
            value={form.year}
            onChangeText={(value) => onChange('year', value)}
            keyboardType="number-pad"
            error={errors.year}
          />
        </View>
        <View style={styles.dateField}>
          <FormField
            label="Ай · Month"
            placeholder="5"
            value={form.month ?? ''}
            onChangeText={(value) => onChange('month', value)}
            keyboardType="number-pad"
            error={errors.month}
          />
        </View>
        <View style={styles.dateField}>
          <FormField
            label="Күн · Day"
            placeholder="12"
            value={form.day ?? ''}
            onChangeText={(value) => onChange('day', value)}
            keyboardType="number-pad"
            error={errors.day}
          />
        </View>
      </View>

      <View style={styles.storyField}>
        <Text style={styles.sectionLabel}>Сипаттама · Description *</Text>
        <TextInput
          placeholder="Отбасы естeliгі, насихат немесе қысқа тарих..."
          placeholderTextColor={Palette.textMuted}
          value={form.story}
          onChangeText={(value) => onChange('story', value)}
          multiline
          textAlignVertical="top"
          style={[styles.storyInput, errors.story ? styles.storyInputError : null]}
        />
        {errors.story ? <Text style={styles.errorText}>{errors.story}</Text> : null}
      </View>

      {form.category === 'photo' || form.category === 'story' ? (
        <PhotoPlaceholderUpload
          hasPhoto={form.hasPhoto}
          onChange={(hasPhoto) => onChange('hasPhoto', hasPhoto)}
        />
      ) : null}

      {form.category === 'voice' ? (
        <Card style={styles.mockCard}>
          <Text style={styles.mockIcon}>🎙️</Text>
          <Text style={styles.mockTitle}>Дауыс жазба · Voice note</Text>
          <Text style={styles.hint}>Mock · настоящая запись аудио будет позже</Text>
        </Card>
      ) : null}

      {form.category === 'document' ? (
        <Card style={styles.mockCard}>
          <Text style={styles.mockIcon}>📄</Text>
          <Text style={styles.mockTitle}>Құжат · Document</Text>
          <Text style={styles.hint}>Mock · загрузка файлов будет позже</Text>
        </Card>
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
  mockCard: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.lg,
    backgroundColor: Palette.cream,
  },
  mockIcon: {
    fontSize: 34,
  },
  mockTitle: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '700',
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
