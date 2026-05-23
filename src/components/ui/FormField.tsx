import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type FormFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
};

export function FormField({ label, hint, error, style, ...props }: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={Palette.textMuted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  label: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  input: {
    ...Typography.body,
    backgroundColor: Palette.white,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Palette.textPrimary,
    minHeight: 56,
  },
  inputError: {
    borderColor: Palette.danger,
  },
  hint: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  error: {
    ...Typography.caption,
    color: Palette.danger,
    fontWeight: '600',
  },
});
