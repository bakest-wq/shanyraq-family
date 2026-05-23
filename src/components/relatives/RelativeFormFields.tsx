import { useMemo } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { RelativeLinkPicker } from '@/components/relatives/RelativeLinkPicker';
import { BirthdayPicker } from '@/components/relatives/BirthdayPicker';
import { RelationshipSelector } from '@/components/relatives/RelationshipSelector';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import {
  CreateRelativeInput,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  Relative,
} from '@/types/relative';
import { getAllParentCandidates } from '@/utils/family-tree';
import {
  findFamilyAnchor,
  formatRelationshipPath,
  getChildrenOf,
  getRelationshipPath,
} from '@/utils/kinship-path';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { RelativeFormErrors } from '@/utils/validation';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type RelativeFormFieldsProps = {
  form: CreateRelativeInput;
  errors: RelativeFormErrors;
  saveError?: string | null;
  relatives: Relative[];
  editingRelativeId?: string;
  onChange: <K extends keyof CreateRelativeInput>(
    key: K,
    value: CreateRelativeInput[K],
  ) => void;
};

export function RelativeFormFields({
  form,
  errors,
  saveError,
  relatives,
  editingRelativeId,
  onChange,
}: RelativeFormFieldsProps) {
  const linkCandidates = useMemo(() => {
    if (!editingRelativeId) {
      return relatives.filter((relative) => !relative.isDeceased);
    }

    return getAllParentCandidates(relatives, editingRelativeId);
  }, [relatives, editingRelativeId]);

  const previewRelative = useMemo((): Relative | null => {
    if (editingRelativeId) {
      return relatives.find((relative) => relative.id === editingRelativeId) ?? null;
    }

    return {
      id: 'preview',
      fullName: form.fullName,
      firstName: form.firstName,
      middleName: form.middleName,
      birthSurname: form.birthSurname,
      currentSurname: form.currentSurname,
      displayName: form.displayName ?? form.fullName ?? form.firstName,
      relationship: form.relationship,
      birthday: form.birthday,
      birthdayDay: form.birthdayDay,
      birthdayMonth: form.birthdayMonth,
      birthdayYear: form.birthdayYear,
      birthdayYearUnknown: form.birthdayYearUnknown,
      phone: form.phone ?? '',
      avatarColor: form.avatarColor ?? '#2D6A4F',
      isDeceased: form.isDeceased ?? false,
      fatherId: form.fatherId ?? undefined,
      motherId: form.motherId ?? undefined,
      spouseId: form.spouseId ?? undefined,
      gender: form.gender,
      maritalStatus: form.maritalStatus,
    };
  }, [editingRelativeId, form, relatives]);

  const relationshipPath = useMemo(() => {
    if (!previewRelative) {
      return null;
    }

    const anchor = findFamilyAnchor(relatives);
    return formatRelationshipPath(getRelationshipPath(previewRelative, relatives, anchor));
  }, [previewRelative, relatives]);

  const children = useMemo(() => {
    if (!editingRelativeId) {
      return [];
    }

    return getChildrenOf(editingRelativeId, relatives);
  }, [editingRelativeId, relatives]);

  const showBirthSurname = form.gender === 'female';

  const handleBirthdayChange = (
    patch: Pick<
      CreateRelativeInput,
      'birthday' | 'birthdayDay' | 'birthdayMonth' | 'birthdayYear' | 'birthdayYearUnknown'
    >,
  ) => {
    onChange('birthdayDay', patch.birthdayDay ?? null);
    onChange('birthdayMonth', patch.birthdayMonth ?? null);
    onChange('birthdayYear', patch.birthdayYear ?? null);
    onChange('birthdayYearUnknown', patch.birthdayYearUnknown ?? false);
    onChange('birthday', patch.birthday);
  };

  return (
    <>
      {relationshipPath ? (
        <Card goldBorder style={styles.pathCard}>
          <Text style={styles.sectionLabel}>Туыстық жолы · Relationship path</Text>
          <Text style={styles.pathText}>{relationshipPath}</Text>
        </Card>
      ) : null}

      <Card goldBorder style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Туыстық · Родство</Text>
        <RelationshipSelector
          value={form.relationship}
          error={errors.relationship}
          onChange={(relationship) => onChange('relationship', relationship)}
        />
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Жынысы · Пол</Text>
        <View style={styles.optionRow}>
          {GENDER_OPTIONS.map((option) => {
            const selected = form.gender === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => onChange('gender', option.id)}
                style={[styles.optionChip, selected && styles.optionChipSelected]}>
                <Text style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <FormField
        label="Аты · Имя *"
        placeholder="Мысалы: Айгуль"
        value={form.firstName}
        onChangeText={(value) => onChange('firstName', value)}
        error={errors.firstName}
        autoCapitalize="words"
      />

      <FormField
        label="Әke аты · Отчество"
        placeholder="Мысалы: Нұрланқызы"
        value={form.middleName ?? ''}
        onChangeText={(value) => onChange('middleName', value)}
        autoCapitalize="words"
      />

      <FormField
        label="Тегі · Текущая фамилия"
        placeholder="Мысалы: Қасымова"
        value={form.currentSurname ?? ''}
        onChangeText={(value) => onChange('currentSurname', value)}
        autoCapitalize="words"
      />

      {showBirthSurname ? (
        <FormField
          label="Туған тегі · Фамилия при рождении"
          placeholder="Мысалы: Сейтова"
          value={form.birthSurname ?? ''}
          onChangeText={(value) => onChange('birthSurname', value)}
          autoCapitalize="words"
          hint="Для әйел · maiden name"
        />
      ) : null}

      <FormField
        label="Көрсету аты · Display name"
        placeholder="Как показывать в приложении"
        value={form.displayName ?? ''}
        onChangeText={(value) => onChange('displayName', value)}
        autoCapitalize="words"
        hint="Необязательно · по умолчанию — полное имя"
      />

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Неке · Семейное положение</Text>
        <View style={styles.optionRow}>
          {MARITAL_STATUS_OPTIONS.map((option) => {
            const selected = form.maritalStatus === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => onChange('maritalStatus', option.id)}
                style={[styles.optionChipWide, selected && styles.optionChipSelected]}>
                <Text style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card goldBorder style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Шежіре байланысы · Family links</Text>
        <RelativeLinkPicker
          label="Әke · Отец"
          sublabel="father_id"
          selectedId={form.fatherId}
          candidates={linkCandidates}
          onSelect={(id) => onChange('fatherId', id)}
        />
        <RelativeLinkPicker
          label="Аna · Мать"
          sublabel="mother_id"
          candidates={linkCandidates}
          selectedId={form.motherId}
          onSelect={(id) => onChange('motherId', id)}
        />
        <RelativeLinkPicker
          label="Жұбай · Супруг(а)"
          sublabel="spouse_id"
          candidates={linkCandidates}
          selectedId={form.spouseId}
          onSelect={(id) => onChange('spouseId', id)}
        />
      </Card>

      {editingRelativeId && children.length > 0 ? (
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Балалар · Дети</Text>
          <View style={styles.childrenList}>
            {children.map((child) => (
              <View key={child.id} style={styles.childRow}>
                <Text style={styles.childName}>{getRelativeDisplayName(child)}</Text>
                <Text style={styles.childMeta}>{child.relationship}</Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      <Card goldBorder style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Шежіре деректері · Shezhire</Text>
        <Text style={styles.hint}>Міндетті емес · Необязательно</Text>
        <FormField
          label="Жүз · Zhuz"
          placeholder="Мысалы: Орта жүз"
          value={form.zhuz ?? ''}
          onChangeText={(value) => onChange('zhuz', value)}
          autoCapitalize="words"
        />
        <FormField
          label="Ру · Ru"
          placeholder="Мысалы: Аргын"
          value={form.ru ?? ''}
          onChangeText={(value) => onChange('ru', value)}
          autoCapitalize="words"
        />
        <FormField
          label="Ата тегі · Ata line"
          placeholder="Мысалы: Қантық"
          value={form.ataLine ?? ''}
          onChangeText={(value) => onChange('ataLine', value)}
          autoCapitalize="words"
        />
        <FormField
          label="Тармақ · Branch"
          placeholder="Мысалы: Торғай"
          value={form.tribeBranch ?? ''}
          onChangeText={(value) => onChange('tribeBranch', value)}
          autoCapitalize="words"
        />
      </Card>

      <BirthdayPicker
        day={form.birthdayDay}
        month={form.birthdayMonth}
        year={form.birthdayYear}
        yearUnknown={form.birthdayYearUnknown ?? false}
        error={errors.birthday}
        onChange={handleBirthdayChange}
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
  pathCard: {
    gap: Spacing.sm,
  },
  pathText: {
    ...Typography.body,
    color: Palette.greenMid,
    fontWeight: '700',
    lineHeight: 26,
  },
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
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionChip: {
    minWidth: '47%',
    flexGrow: 1,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    backgroundColor: Palette.cream,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  optionChipWide: {
    width: '48%',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    backgroundColor: Palette.cream,
    padding: Spacing.sm,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  optionChipSelected: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.gold,
  },
  optionChipText: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  optionChipTextSelected: {
    color: Palette.white,
  },
  childrenList: {
    gap: Spacing.sm,
  },
  childRow: {
    backgroundColor: Palette.cream,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: 2,
  },
  childName: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  childMeta: {
    ...Typography.caption,
    color: Palette.textSecondary,
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
