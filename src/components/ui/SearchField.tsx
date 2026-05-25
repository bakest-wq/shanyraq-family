import { useMemo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '@/hooks/useElderMode';
import { Radius, Shadow } from '@/constants/theme';

type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Іздеу...',
}: SearchFieldProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.palette.textMuted}
        style={styles.input}
        autoCapitalize="words"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.palette.white,
      borderRadius: Radius.lg,
      borderWidth: theme.layout.cardBorderWidth,
      borderColor: theme.palette.creamDark,
      paddingHorizontal: theme.spacing.md,
      minHeight: theme.elderMode ? 64 : 56,
      ...Shadow.soft,
    },
    icon: {
      fontSize: theme.elderMode ? 24 : 20,
    },
    input: {
      flex: 1,
      ...theme.typography.body,
      color: theme.palette.textPrimary,
      paddingVertical: theme.spacing.sm,
      fontWeight: theme.elderMode ? '700' : '500',
    },
  });
}
