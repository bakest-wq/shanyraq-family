import { useMemo } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { BirthdayPicker } from '@/components/relatives/BirthdayPicker';
import { FamilyLinkSections } from '@/components/relatives/FamilyLinkSections';
import { RelativePhotoPicker } from '@/components/relatives/RelativePhotoPicker';
import { RuPicker } from '@/components/relatives/RuPicker';
import { RelationshipSelector } from '@/components/relatives/RelationshipSelector';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { HelperHintBanner } from '@/components/ui/HelperHintBanner';
import {
  CreateRelativeInput,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  Relative,
} from '@/types/relative';
import {
  findFamilyAnchor,
  formatRelationshipPath,
  getRelationshipPath,
} from '@/utils/kinship-path';
import { SECTION_HELPER_TEXT } from '@/constants/family-ux-content';
import { getRelativeDisplayName } from '@/utils/relative-names';
import {
  getParentSideAutoLabelHelperText,
  getParentSideSiblingHelperText,
  isParentSideSiblingRelationship,
} from '@/utils/parent-side-sibling-add';
import { pickAvatarColor } from '@/utils/relative.mapper';
import { RelativeFormErrors } from '@/utils/validation';
import { RuSelection } from '@/utils/ru-dictionary';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type RelativeFormFieldsProps = {
  form: CreateRelativeInput;
  errors: RelativeFormErrors;
  saveError?: string | null;
  relatives: Relative[];
  editingRelativeId?: string;
  referenceRootId?: string | null;
  linkedChildIds?: string[];
  onLinkedChildIdsChange?: (ids: string[]) => void;
  onChange: <K extends keyof CreateRelativeInput>(
    key: K,
    value: CreateRelativeInput[K],
  ) => void;
  onPatch?: (patch: Partial<CreateRelativeInput>) => void;
  onSiblingParentSync?: (siblingId: string, patch: Partial<CreateRelativeInput>) => void;
};

export function RelativeFormFields({
  form,
  errors,
  saveError,
  relatives,
  editingRelativeId,
  referenceRootId,
  linkedChildIds = [],
  onLinkedChildIdsChange,
  onChange,
  onPatch,
  onSiblingParentSync,
}: RelativeFormFieldsProps) {
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
      photoUrl: form.photoUrl,
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

  const handleBirthdayChange = (
    patch: Pick<
      CreateRelativeInput,
      'birthday' | 'birthdayDay' | 'birthdayMonth' | 'birthdayYear' | 'birthdayYearUnknown'
    >,
  ) => {
    const birthdayPatch: Partial<CreateRelativeInput> = {
      birthdayDay: patch.birthdayDay ?? null,
      birthdayMonth: patch.birthdayMonth ?? null,
      birthdayYear: patch.birthdayYear ?? null,
      birthdayYearUnknown: patch.birthdayYearUnknown ?? false,
      birthday: patch.birthday ?? '',
    };

    if (onPatch) {
      onPatch(birthdayPatch);
      return;
    }

    onChange('birthdayDay', birthdayPatch.birthdayDay ?? null);
    onChange('birthdayMonth', birthdayPatch.birthdayMonth ?? null);
    onChange('birthdayYear', birthdayPatch.birthdayYear ?? null);
    onChange('birthdayYearUnknown', birthdayPatch.birthdayYearUnknown ?? false);
    onChange('birthday', birthdayPatch.birthday ?? '');
  };

  const showBirthSurname = form.gender === 'female';
  const parentSideSiblingHelper = getParentSideSiblingHelperText(form.relationship);
  const parentSideAutoLabelHelper = isParentSideSiblingRelationship(form.relationship)
    ? getParentSideAutoLabelHelperText()
    : null;

  const handleRuChange = (patch: Partial<RuSelection>) => {
    if (patch.zhuz !== undefined) {
      onChange('zhuz', patch.zhuz);
    }
    if (patch.ru !== undefined) {
      onChange('ru', patch.ru);
    }
    if (patch.tribeBranch !== undefined) {
      onChange('tribeBranch', patch.tribeBranch);
    }
    if (patch.ataLine !== undefined) {
      onChange('ataLine', patch.ataLine);
    }
  };

  return (
    <>
      <Card goldBorder style={styles.sectionCard}>
        <RelativePhotoPicker
          name={
            previewRelative
              ? getRelativeDisplayName(previewRelative)
              : form.firstName || form.fullName || 'A'
          }
          color={form.avatarColor ?? pickAvatarColor(form.firstName || form.fullName || 'A')}
          photoUrl={form.clearPhoto ? undefined : form.photoUrl}
          pendingPhotoUri={form.pendingPhotoUri}
          onPhotoSelected={(uri) => {
            onChange('pendingPhotoUri', uri);
            onChange('clearPhoto', false);
          }}
          onPhotoRemoved={() => {
            onChange('pendingPhotoUri', undefined);
            onChange('photoUrl', undefined);
            onChange('clearPhoto', true);
          }}
        />
      </Card>

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
        {parentSideSiblingHelper ? (
          <HelperHintBanner text={parentSideSiblingHelper} />
        ) : null}
        {parentSideAutoLabelHelper ? (
          <HelperHintBanner text={parentSideAutoLabelHelper} tone="cream" />
        ) : null}
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
        hint="Тек көрсету үшін · Display only, does not affect tree links"
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

      <FamilyLinkSections
        form={form}
        errors={errors}
        relatives={relatives}
        editingRelativeId={editingRelativeId}
        referenceRootId={referenceRootId}
        linkedChildIds={linkedChildIds}
        onLinkedChildIdsChange={onLinkedChildIdsChange}
        onChange={onChange}
        onPatch={onPatch}
        onSiblingParentSync={onSiblingParentSync}
      />

      <Card goldBorder style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Шежіре деректері · Shezhire</Text>
        <HelperHintBanner
          icon="🌿"
          text={SECTION_HELPER_TEXT.ruSelection.text}
          subtext={SECTION_HELPER_TEXT.ruSelection.subtext}
          tone="cream"
        />
        <RuPicker
          zhuz={form.zhuz}
          ru={form.ru}
          tribeBranch={form.tribeBranch}
          ataLine={form.ataLine}
          onChange={handleRuChange}
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
