import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type EmptyStateProps = {
  icon?: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon = '🏠',
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} variant="green" />
      ) : null}
    </View>
  );
}

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, styles.errorWrap]}>
        <Text style={styles.icon}>⚠️</Text>
      </View>
      <Text style={styles.title}>Қате · Ошибка</Text>
      <Text style={styles.subtitle}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Қайта көру · Повторить</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.md,
    ...Shadow.soft,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Palette.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorWrap: {
    backgroundColor: '#FFF1E8',
  },
  icon: {
    fontSize: 32,
  },
  title: {
    ...Typography.subtitle,
    color: Palette.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  retryText: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
});
