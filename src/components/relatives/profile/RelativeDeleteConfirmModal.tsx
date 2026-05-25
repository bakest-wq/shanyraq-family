import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import type { RelativeReferenceLink } from '@/utils/get-relative-references';
import { formatRelativeReferencesMessage } from '@/utils/get-relative-references';
import {
  DELETE_RELATIVE_COPY,
  type RelativeDeleteModalStep,
} from '@/utils/relative-delete-flow';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type RelativeDeleteConfirmModalProps = {
  visible: boolean;
  step: RelativeDeleteModalStep;
  displayName: string;
  referenceLinks: RelativeReferenceLink[];
  deleting: boolean;
  clearing: boolean;
  isLinkedSelf: boolean;
  onCancel: () => void;
  onRootContinue: () => void;
  onClearReferences: () => void;
  onConfirmDelete: () => void;
  onSuccessClose: () => void;
};

function ModalActions({
  primaryLabel,
  primaryVariant = 'gold',
  primaryDisabled = false,
  onPrimary,
  secondaryLabel,
  onSecondary,
  dangerPrimary = false,
}: {
  primaryLabel: string;
  primaryVariant?: 'gold' | 'danger';
  primaryDisabled?: boolean;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
  dangerPrimary?: boolean;
}) {
  return (
    <View style={styles.actions}>
      <PrimaryButton
        label={primaryLabel}
        variant={dangerPrimary ? 'danger' : primaryVariant}
        disabled={primaryDisabled}
        onPress={onPrimary}
      />
      <Pressable
        onPress={onSecondary}
        style={styles.secondaryAction}
        accessibilityRole="button"
        accessibilityLabel={secondaryLabel}>
        <Text style={styles.secondaryActionLabel}>{secondaryLabel}</Text>
      </Pressable>
    </View>
  );
}

export function RelativeDeleteConfirmModal({
  visible,
  step,
  displayName,
  referenceLinks,
  deleting,
  clearing,
  isLinkedSelf,
  onCancel,
  onRootContinue,
  onClearReferences,
  onConfirmDelete,
  onSuccessClose,
}: RelativeDeleteConfirmModalProps) {
  if (!visible || step === 'closed') {
    return null;
  }

  const referenceMessage = formatRelativeReferencesMessage(referenceLinks);

  let title: string = DELETE_RELATIVE_COPY.confirmTitle;
  let body: string = DELETE_RELATIVE_COPY.confirmHint;
  let content: ReactNode = null;

  if (step === 'root_confirm') {
    title = isLinkedSelf
      ? DELETE_RELATIVE_COPY.linkedSelfDeleteTitle
      : DELETE_RELATIVE_COPY.rootDeleteTitle;
    body = isLinkedSelf
      ? DELETE_RELATIVE_COPY.linkedSelfDeleteMessage
      : DELETE_RELATIVE_COPY.rootDeleteMessage;
  } else if (step === 'blocked') {
    title = DELETE_RELATIVE_COPY.blockedTitle;
    body = DELETE_RELATIVE_COPY.blockedHint;
    content = referenceMessage ? (
      <ScrollView style={styles.referenceList} nestedScrollEnabled>
        <Text style={styles.referenceText}>{referenceMessage}</Text>
      </ScrollView>
    ) : null;
  } else if (step === 'clear_done') {
    title = DELETE_RELATIVE_COPY.clearReferencesDone;
    body = DELETE_RELATIVE_COPY.confirmHint;
  } else if (step === 'success') {
    title = DELETE_RELATIVE_COPY.successTitle;
    body = '';
  } else {
    content = displayName ? <Text style={styles.name}>{displayName}</Text> : null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} accessibilityRole="button" />
        <View style={styles.sheet} accessibilityViewIsModal>
          <Text style={styles.title}>{title}</Text>
          {body ? <Text style={styles.body}>{body}</Text> : null}
          {content}

          {step === 'root_confirm' ? (
            <ModalActions
              primaryLabel={DELETE_RELATIVE_COPY.confirm}
              dangerPrimary
              onPrimary={onRootContinue}
              secondaryLabel={DELETE_RELATIVE_COPY.abortDelete}
              onSecondary={onCancel}
            />
          ) : null}

          {step === 'blocked' ? (
            <ModalActions
              primaryLabel={clearing ? DELETE_RELATIVE_COPY.deleting : DELETE_RELATIVE_COPY.clearReferences}
              primaryDisabled={clearing || deleting}
              onPrimary={onClearReferences}
              secondaryLabel={DELETE_RELATIVE_COPY.abortDelete}
              onSecondary={onCancel}
            />
          ) : null}

          {step === 'confirm' || step === 'clear_done' ? (
            <ModalActions
              primaryLabel={deleting ? DELETE_RELATIVE_COPY.deleting : DELETE_RELATIVE_COPY.confirm}
              dangerPrimary
              primaryDisabled={deleting || clearing}
              onPrimary={onConfirmDelete}
              secondaryLabel={DELETE_RELATIVE_COPY.cancel}
              onSecondary={onCancel}
            />
          ) : null}

          {step === 'success' ? (
            <PrimaryButton label={DELETE_RELATIVE_COPY.successOk} variant="gold" onPress={onSuccessClose} />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    ...(Platform.OS === 'web'
      ? ({
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10000,
        } as object)
      : null),
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(44, 74, 62, 0.52)',
  },
  sheet: {
    gap: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Palette.cream,
    borderWidth: 1.5,
    borderColor: Palette.goldLight,
    padding: Spacing.lg,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    ...Shadow.card,
  },
  title: {
    ...Typography.title,
    color: Palette.greenDeep,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 28,
  },
  body: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  name: {
    ...Typography.body,
    color: Palette.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
  },
  referenceList: {
    maxHeight: 160,
  },
  referenceText: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    lineHeight: 24,
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  secondaryAction: {
    alignSelf: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  secondaryActionLabel: {
    ...Typography.bodySmall,
    color: Palette.greenMid,
    fontWeight: '600',
    textAlign: 'center',
  },
});
