import { StyleSheet, Text, View } from 'react-native';

import { ContactButtons } from '@/components/ui/ContactButtons';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { FAMILY_SPACE_COPY } from '@/constants/family-space-content';
import { Relative } from '@/types/relative';
import { Palette, Spacing, Typography } from '@/constants/theme';

type RelativeProfileActionsProps = {
  relative: Relative;
  displayName: string;
  deleting: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onCongratulations: () => void;
  onDelete: () => void;
};

export function RelativeProfileActions({
  relative,
  displayName,
  deleting,
  canEdit,
  canDelete,
  onEdit,
  onCongratulations,
  onDelete,
}: RelativeProfileActionsProps) {
  return (
    <View style={styles.wrap}>
      {canEdit ? (
        <PrimaryButton
          label="Өзгерту · Edit"
          sublabel="Байланыстар мен аты-жөн · Links and profile"
          variant="green"
          onPress={onEdit}
        />
      ) : (
        <View style={styles.readOnlyBox}>
          <Text style={styles.readOnlyTitle}>{FAMILY_SPACE_COPY.suggestEditInstead}</Text>
          <Text style={styles.readOnlyText}>{FAMILY_SPACE_COPY.memberReadOnlyHint}</Text>
        </View>
      )}

      {!relative.isDeceased && relative.phone ? (
        <ContactButtons phone={relative.phone} name={displayName} />
      ) : null}

      {!relative.isDeceased ? (
        <PrimaryButton
          label="AI поздравление"
          sublabel="Жылулы құттықтау · Тёплое поздравление"
          variant="gold"
          onPress={onCongratulations}
        />
      ) : null}

      {canDelete ? (
        <PrimaryButton
          label={deleting ? 'Жойылуда...' : 'Жою · Удалить'}
          sublabel="Бұл әрекетті қайтаруға болмайды"
          variant="danger"
          onPress={deleting ? undefined : onDelete}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  readOnlyBox: {
    gap: Spacing.xs,
    backgroundColor: Palette.creamDark,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.creamDark,
  },
  readOnlyTitle: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
    textAlign: 'center',
  },
  readOnlyText: {
    ...Typography.caption,
    color: Palette.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
});
