import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type ContactButtonsProps = {
  phone: string;
  name: string;
};

export function ContactButtons({ phone, name }: ContactButtonsProps) {
  const handleCall = () => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = () => {
    const digits = phone.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${digits}?text=${encodeURIComponent(`Ассалаумағалейкум, ${name}!`)}`);
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={handleCall}
        style={({ pressed }) => [styles.button, styles.call, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`Позвонить ${name}`}>
        <Text style={styles.icon}>📞</Text>
        <Text style={styles.label}>Қоңырау</Text>
      </Pressable>
      <Pressable
        onPress={handleWhatsApp}
        style={({ pressed }) => [styles.button, styles.whatsapp, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`WhatsApp ${name}`}>
        <Text style={styles.icon}>💬</Text>
        <Text style={styles.label}>WhatsApp</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 52,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  call: {
    backgroundColor: Palette.greenDeep,
  },
  whatsapp: {
    backgroundColor: Palette.whatsapp,
  },
  pressed: {
    opacity: 0.88,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    ...Typography.bodySmall,
    color: Palette.white,
    fontWeight: '700',
  },
});
