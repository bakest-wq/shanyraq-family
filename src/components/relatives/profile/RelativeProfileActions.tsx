import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { COGNITIVE_LOAD_COPY } from '@/constants/cognitive-load-content';
import { GENEALOGY_UX_COPY } from '@/constants/genealogy-ux-content';
import { FAMILY_SPACE_COPY } from '@/constants/family-space-content';
import { DELETE_RELATIVE_COPY } from '@/utils/relative-delete-flow';
import { Relative } from '@/types/relative';
import { focusPersonInShezhire } from '@/utils/shezhire-navigation';
import { openRelativeWhatsApp } from '@/utils/whatsapp-contact';
import { Palette, Spacing, Typography } from '@/constants/theme';

type RelativeProfileActionsProps = {
  relative: Relative;
  displayName: string;
  deleting: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onCongratulations: () => void;
  onDelete: () => void;
};

function openWhatsAppContact(phone: string | undefined | null, name: string) {
  openRelativeWhatsApp({ phone, name });
}

function TextLinkAction({
  label,
  onPress,
  danger = false,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={styles.textAction}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Text style={[styles.textActionLabel, danger && styles.textActionDanger]}>{label}</Text>
    </Pressable>
  );
}

/** Main profile CTA — Shezhire first, always visible. */
export function RelativeProfilePrimaryActions({
  relative,
  displayName,
}: Pick<RelativeProfileActionsProps, 'relative' | 'displayName'>) {
  const router = useRouter();
  const showWhatsApp = !relative.isDeceased;

  const handleOpenInShezhire = () => {
    focusPersonInShezhire(router, relative.id);
  };

  return (
    <View style={styles.primaryWrap}>
      <PrimaryButton
        label={GENEALOGY_UX_COPY.viewInShezhire}
        sublabel={GENEALOGY_UX_COPY.viewInShezhireHint.kk}
        variant="gold"
        onPress={handleOpenInShezhire}
      />
      {showWhatsApp ? (
        <TextLinkAction
          label={COGNITIVE_LOAD_COPY.contactWhatsApp}
          onPress={() => openWhatsAppContact(relative.phone, displayName)}
        />
      ) : null}
    </View>
  );
}

/** Secondary actions — congratulations, delete, permissions. */
export function RelativeProfileFooterActions({
  relative,
  deleting,
  canEdit,
  canDelete,
  onCongratulations,
  onDelete,
}: Omit<RelativeProfileActionsProps, 'displayName'>) {
  const handleDeletePress = () => {
    if (deleting) {
      return;
    }

    onDelete();
  };

  return (
    <View style={styles.footerWrap}>
      {!canEdit ? (
        <View style={styles.readOnlyBox}>
          <Text style={styles.readOnlyTitle}>{FAMILY_SPACE_COPY.suggestEditInstead}</Text>
          <Text style={styles.readOnlyText}>{FAMILY_SPACE_COPY.memberReadOnlyHint}</Text>
        </View>
      ) : null}

      {!relative.isDeceased ? (
        <TextLinkAction
          label={COGNITIVE_LOAD_COPY.congratulations}
          onPress={onCongratulations}
        />
      ) : null}

      {canDelete ? (
        <View style={styles.deleteSection}>
          <PrimaryButton
            label={deleting ? DELETE_RELATIVE_COPY.deleting : DELETE_RELATIVE_COPY.deleteLabel}
            variant="danger"
            disabled={deleting}
            onPress={handleDeletePress}
          />
        </View>
      ) : null}
    </View>
  );
}

/** @deprecated Use RelativeProfilePrimaryActions + RelativeProfileFooterActions */
export function RelativeProfileActions(props: RelativeProfileActionsProps) {
  return (
    <>
      <RelativeProfilePrimaryActions relative={props.relative} displayName={props.displayName} />
      <RelativeProfileFooterActions
        relative={props.relative}
        deleting={props.deleting}
        canEdit={props.canEdit}
        canDelete={props.canDelete}
        onCongratulations={props.onCongratulations}
        onDelete={props.onDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  primaryWrap: {
    gap: Spacing.sm,
  },
  footerWrap: {
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
  textAction: {
    alignSelf: 'center',
    paddingVertical: Spacing.xs,
  },
  textActionLabel: {
    ...Typography.bodySmall,
    color: Palette.greenMid,
    fontWeight: '600',
  },
  textActionDanger: {
    color: Palette.textMuted,
  },
  deleteSection: {
    paddingTop: Spacing.sm,
  },
});
