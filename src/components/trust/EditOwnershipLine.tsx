import { StyleSheet, Text, View } from 'react-native';

import { EDIT_HISTORY_COPY } from '@/constants/edit-history-content';
import { useLatestEdit } from '@/hooks/useEditHistory';
import type { EditEntityType } from '@/types/edit-history';
import { formatEditTimestamp } from '@/utils/edit-history-snapshot';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type EditOwnershipLineProps = {
  entityType: EditEntityType;
  entityId: string;
};

export function EditOwnershipLine({ entityType, entityId }: EditOwnershipLineProps) {
  const latest = useLatestEdit(entityType, entityId);

  if (!latest) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>
        {EDIT_HISTORY_COPY.ownershipLine(
          latest.actor.displayName,
          formatEditTimestamp(latest.at),
        )}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    backgroundColor: '#F8FAF7',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E8E0D0',
  },
  text: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
