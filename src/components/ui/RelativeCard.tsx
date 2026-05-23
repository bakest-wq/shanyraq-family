import { StyleSheet, Text, View } from 'react-native';

import { Relative } from '@/types/relative';
import { calculateAge, formatBirthdayKzRu, getAgeLabel } from '@/utils/dates';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

import { ContactButtons } from './ContactButtons';

type AvatarPlaceholderProps = {
  name: string;
  color: string;
  size?: number;
  deceased?: boolean;
};

export function AvatarPlaceholder({ name, color, size = 64, deceased = false }: AvatarPlaceholderProps) {
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        deceased && styles.deceased,
      ]}>
      <Text style={[styles.initial, { fontSize: size * 0.38 }]}>{initial}</Text>
    </View>
  );
}

type RelativeCardProps = {
  relative: Relative;
  showActions?: boolean;
};

export function RelativeCard({ relative, showActions = true }: RelativeCardProps) {
  const age = calculateAge(relative);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <AvatarPlaceholder
          name={relative.fullName}
          color={relative.avatarColor}
          deceased={relative.isDeceased}
        />
        <View style={styles.info}>
          <Text style={styles.role}>{relative.relationship}</Text>
          <Text style={styles.name}>{relative.fullName}</Text>
          <Text style={styles.meta}>{formatBirthdayKzRu(relative)}</Text>
          {age !== null ? <Text style={styles.age}>{getAgeLabel(age)}</Text> : null}
        </View>
      </View>
      {showActions && relative.phone ? (
        <ContactButtons phone={relative.phone} name={relative.fullName} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Palette.goldLight,
  },
  deceased: {
    opacity: 0.75,
  },
  initial: {
    color: Palette.white,
    fontWeight: '700',
  },
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.creamDark,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  role: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    ...Typography.subtitle,
    color: Palette.textPrimary,
  },
  meta: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
  },
  age: {
    ...Typography.bodySmall,
    color: Palette.greenMid,
    fontWeight: '600',
  },
});
