import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { EmptyStatePreset } from '@/constants/family-ux-content';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type EmptyStateProps = {
  icon?: string;
  title: string;
  subtitle: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
};

export function EmptyState({
  icon = '🏠',
  title,
  subtitle,
  hint,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.illustrationWrap}>
        <View style={styles.shapeBack} />
        <View style={styles.shapeAccent} />
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} variant="green" />
      ) : null}
    </View>
  );
}

type PresetEmptyStateProps = {
  preset: EmptyStatePreset;
  onAction?: () => void;
  style?: ViewStyle;
};

export function PresetEmptyState({ preset, onAction, style }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={preset.icon}
      title={preset.title}
      subtitle={preset.subtitle}
      hint={preset.hint}
      actionLabel={preset.actionLabel}
      onAction={onAction}
      style={style}
    />
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
    borderWidth: 1,
    borderColor: Palette.goldLight,
    padding: Spacing.xl,
    gap: Spacing.md,
    ...Shadow.soft,
  },
  illustrationWrap: {
    width: 120,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  shapeBack: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Palette.goldLight,
    backgroundColor: Palette.cream,
  },
  shapeAccent: {
    position: 'absolute',
    top: 8,
    right: 12,
    width: 18,
    height: 18,
    borderRadius: Radius.full,
    backgroundColor: Palette.goldLight,
    opacity: 0.55,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Palette.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Palette.goldLight,
  },
  errorWrap: {
    backgroundColor: '#FFF1E8',
    borderColor: '#E8C4BC',
  },
  icon: {
    fontSize: 32,
  },
  title: {
    ...Typography.subtitle,
    color: Palette.greenDeep,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
  hint: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.sm,
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
