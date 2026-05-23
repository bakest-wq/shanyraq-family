import { StyleSheet, Switch, Text, View } from 'react-native';
import { Pressable } from 'react-native';

import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { CreateRelativeInput, RELATIONSHIP_PRESETS } from '@/types/relative';
import { RelativeFormErrors } from '@/utils/validation';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type RelativeFormFieldsProps = {
  form: CreateRelativeInput;
  errors: RelativeFormErrors;
  saveError?: string | null;
  onChange: <K extends keyof CreateRelativeInput>(
    key: K,
    value: CreateRelativeInput[K],
  ) => void;
};

export function RelativeFormFields({
  form,
  errors,
  saveError,
  onChange,
}: RelativeFormFieldsProps) {
  return (
    <>
      <Card goldBorder style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Туыстық · Родство</Text>
        <View style={styles.relationshipGrid}>
          {RELATIONSHIP_PRESETS.map((relationship) => {
            const selected = form.relationship === relationship;
            return (
              <Pressable
                key={relationship}
                onPress={() => onChange('relationship', relationship)}
                style={({ pressed }) => [
                  styles.relationshipButton,
                  selected && styles.relationshipButtonSelected,
                  pressed && styles.relationshipButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}>
                <Text
                  style={[
                    styles.relationshipButtonText,
                    selected && styles.relationshipButtonTextSelected,
                  ]}>
                  {relationship}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {errors.relationship ? <Text style={styles.errorText}>{errors.relationship}</Text> : null}
      </Card>

      <FormField
        label="Толық аты · Полное имя *"
        placeholder="Мысалы: Нұрлан Қасымов"
        value={form.fullName}
        onChangeText={(value) => onChange('fullName', value)}
        error={errors.fullName}
        autoCapitalize="words"
      />

      <FormField
        label="Туған күні · Дата рождения"
        placeholder="YYYY-MM-DD"
        value={form.birthday}
        onChangeText={(value) => onChange('birthday', value)}
        keyboardType="numbers-and-punctuation"
        error={errors.birthday}
        hint="Необязательно · Формат YYYY-MM-DD"
      />

      <FormField
        label="Телефон · WhatsApp"
        placeholder="+77001234567"
        value={form.phone ?? ''}
        onChangeText={(value) => onChange('phone', value)}
        keyboardType="phone-pad"
        error={errors.phone}
        hint="Қазақстан форматы · +7XXXXXXXXXX"
      />

      <FormField
        label="Ескертпе · Заметки"
        placeholder="Мысалы: Алматыда тұрады"
        value={form.notes ?? ''}
        onChangeText={(value) => onChange('notes', value)}
        multiline
        style={styles.textArea}
      />

      <View style={styles.switchRow}>
        <View style={styles.switchTextWrap}>
          <Text style={styles.sectionLabel}>Марқұм · Ушедший</Text>
          <Text style={styles.hint}>Отметьте, если родственник ушёл из жизни</Text>
        </View>
        <Switch
          value={form.isDeceased ?? false}
          onValueChange={(value) => onChange('isDeceased', value)}
          trackColor={{ false: Palette.creamDark, true: Palette.greenSoft }}
          thumbColor={form.isDeceased ? Palette.greenDeep : Palette.white}
        />
      </View>

      {form.isDeceased ? (
        <>
          <FormField
            label="Жылы · Год смерти *"
            placeholder="2015"
            value={form.deathYear ? String(form.deathYear) : ''}
            onChangeText={(value) => onChange('deathYear', value ? Number(value) : undefined)}
            keyboardType="number-pad"
            error={errors.deathYear}
            hint="4 цифры · например 2015"
            maxLength={4}
          />
          <FormField
            label="Дұға · Памятная фраза"
            placeholder="Аллаh разы болсын..."
            value={form.duaText ?? ''}
            onChangeText={(value) => onChange('duaText', value)}
            multiline
            style={styles.textArea}
          />
        </>
      ) : null}

      {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    gap: Spacing.md,
  },
  sectionLabel: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
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
  relationshipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  relationshipButton: {
    width: '48%',
    minHeight: 56,
    borderRadius: Radius.lg,
    backgroundColor: Palette.cream,
    borderWidth: 2,
    borderColor: Palette.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    ...Shadow.soft,
  },
  relationshipButtonSelected: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.gold,
  },
  relationshipButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  relationshipButtonText: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  relationshipButtonTextSelected: {
    color: Palette.white,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.soft,
  },
  switchTextWrap: {
    flex: 1,
    gap: Spacing.xs,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
