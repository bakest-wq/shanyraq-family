import { StyleSheet, View } from 'react-native';

import { ContactButtons } from '@/components/ui/ContactButtons';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Relative } from '@/types/relative';
import { Spacing } from '@/constants/theme';

type RelativeProfileActionsProps = {
  relative: Relative;
  displayName: string;
  deleting: boolean;
  onEdit: () => void;
  onCongratulations: () => void;
  onDelete: () => void;
};

export function RelativeProfileActions({
  relative,
  displayName,
  deleting,
  onEdit,
  onCongratulations,
  onDelete,
}: RelativeProfileActionsProps) {
  return (
    <View style={styles.wrap}>
      <PrimaryButton
        label="Өзгерту · Edit"
        sublabel="Байланыстар мен аты-жөн · Links and profile"
        variant="green"
        onPress={onEdit}
      />
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

      <PrimaryButton
        label={deleting ? 'Жойылуда...' : 'Жою · Удалить'}
        sublabel="Бұл әрекетті қайтаруға болмайды"
        variant="danger"
        onPress={deleting ? undefined : onDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
});
