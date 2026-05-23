import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Palette, Spacing, Typography } from '@/constants/theme';

type MessagePreviewProps = {
  message: string;
  loading?: boolean;
};

export function MessagePreview({ message, loading = false }: MessagePreviewProps) {
  return (
    <Card goldBorder style={styles.card}>
      <Text style={styles.title}>✨ AI поздравление</Text>
      <View style={styles.messageBox}>
        <Text style={styles.message}>{loading ? 'Генерация...' : message}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
  },
  title: {
    ...Typography.subtitle,
    color: Palette.greenDeep,
  },
  messageBox: {
    backgroundColor: Palette.cream,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.goldLight,
  },
  message: {
    ...Typography.body,
    color: Palette.textPrimary,
    lineHeight: 28,
  },
});
