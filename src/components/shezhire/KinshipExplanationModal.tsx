import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import type { Relative } from '@/types/relative';
import { explainKinship } from '@/utils/kinship/explainKinship';
import { formatKinshipCardLine } from '@/utils/kinship/labels.kz';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type KinshipExplanationModalProps = {
  visible: boolean;
  rootPerson: Relative | null;
  targetPerson: Relative | null;
  relatives: Relative[];
  onClose: () => void;
};

export function KinshipExplanationModal({
  visible,
  rootPerson,
  targetPerson,
  relatives,
  onClose,
}: KinshipExplanationModalProps) {
  if (!rootPerson || !targetPerson) {
    return null;
  }

  const explanation = explainKinship(rootPerson, targetPerson, relatives);
  const cardLine = formatKinshipCardLine(explanation.result);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Туыстық түсіндірме</Text>
          <Text style={styles.names}>
            {getRelativeDisplayName(targetPerson)} · {getRelativeDisplayName(rootPerson)} орталығы
          </Text>
          <Text style={styles.label}>{cardLine}</Text>
          <Text style={styles.summary}>{explanation.summary}</Text>
          {explanation.pathText ? (
            <Text style={styles.path}>{explanation.pathText}</Text>
          ) : null}
          {explanation.hint ? <Text style={styles.hint}>{explanation.hint}</Text> : null}
          <PrimaryButton label="Жабу" variant="gold" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(44, 74, 62, 0.45)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  sheet: {
    gap: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Palette.cream,
    borderWidth: 1.5,
    borderColor: Palette.goldLight,
    padding: Spacing.lg,
  },
  title: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '800',
    textAlign: 'center',
  },
  names: {
    ...Typography.caption,
    color: Palette.textMuted,
    textAlign: 'center',
  },
  label: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '800',
    textAlign: 'center',
  },
  summary: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    lineHeight: 22,
    textAlign: 'center',
  },
  path: {
    ...Typography.caption,
    color: Palette.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  hint: {
    ...Typography.caption,
    color: Palette.textMuted,
    lineHeight: 18,
    textAlign: 'center',
  },
});
