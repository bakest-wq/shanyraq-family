import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Іздеу · Поиск по имени',
}: SearchFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Palette.textMuted}
        style={styles.input}
        autoCapitalize="words"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    paddingHorizontal: Spacing.md,
    minHeight: 56,
    ...Shadow.soft,
  },
  icon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Palette.textPrimary,
    paddingVertical: Spacing.sm,
  },
});
