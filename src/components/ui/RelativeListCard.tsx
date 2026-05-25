import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme, useElderMode } from '@/hooks/useElderMode';
import { Relative } from '@/types/relative';
import {
  calculateAge,
  formatBirthdayKzRu,
  getAgeLabel,
} from '@/utils/dates';
import { buildEditRelativeHref } from '@/utils/edit-relative-navigation';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { focusPersonInShezhire } from '@/utils/shezhire-navigation';
import { openRelativeWhatsApp } from '@/utils/whatsapp-contact';
import { GENEALOGY_UX_COPY } from '@/constants/genealogy-ux-content';
import { Palette, Radius, Shadow } from '@/constants/theme';

import { KinshipBadge } from '@/components/ui/KinshipBadge';
import { AvatarPlaceholder } from './RelativeCard';

type RelativeListCardProps = {
  relative: Relative;
  highlighted?: boolean;
  kinshipLabel?: string | null;
};

export function RelativeListCard({
  relative,
  highlighted = false,
  kinshipLabel,
}: RelativeListCardProps) {
  const router = useRouter();
  const { enabled: elderMode } = useElderMode();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const highlightAnim = useRef(new Animated.Value(0)).current;
  const age = calculateAge(relative);
  const displayName = getRelativeDisplayName(relative);
  const avatarSize = elderMode ? 84 : 76;

  useEffect(() => {
    if (!highlighted) {
      highlightAnim.setValue(0);
      return;
    }

    highlightAnim.setValue(0);
    Animated.sequence([
      Animated.timing(highlightAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: false,
      }),
      Animated.timing(highlightAnim, {
        toValue: 0,
        duration: 2200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [highlightAnim, highlighted]);

  const borderColor = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.palette.goldLight, theme.palette.gold],
  });

  const backgroundColor = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.palette.white, '#FFF9EB'],
  });

  const shadowOpacity = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.22],
  });

  const handleWhatsApp = () => {
    openRelativeWhatsApp({
      phone: relative.phone,
      name: displayName,
    });
  };

  const handleDetails = () => {
    router.push({
      pathname: '/relative/[id]',
      params: { id: relative.id },
    });
  };

  const handleEdit = () => {
    router.push(buildEditRelativeHref(relative.id, 'relatives'));
  };

  const handleOpenInShezhire = () => {
    focusPersonInShezhire(router, relative.id);
  };

  const handleLongPress = () => {
    if (elderMode) {
      return;
    }

    Alert.alert(displayName, undefined, [
      {
        text: GENEALOGY_UX_COPY.viewInShezhire,
        onPress: handleOpenInShezhire,
      },
      {
        text: 'Өзгерту',
        onPress: handleEdit,
      },
      { text: 'Болдырмау', style: 'cancel' },
    ]);
  };

  const showContactAction = !relative.isDeceased;

  return (
    <Animated.View
      style={[
        styles.card,
        relative.isDeceased && styles.cardDeceased,
        highlighted && {
          borderColor,
          backgroundColor,
          shadowColor: Palette.gold,
          shadowOpacity,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        },
      ]}>
      <Pressable
        onPress={handleDetails}
        onLongPress={handleLongPress}
        style={({ pressed }) => [styles.topRowPressable, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`${displayName} · профиль`}
        accessibilityHint={elderMode ? undefined : 'Ұзақ басу — шежіре немесе өңдеу'}>
        <View style={styles.topRow}>
          <AvatarPlaceholder
            name={displayName}
            color={relative.avatarColor}
            photoUrl={relative.photoUrl}
            size={avatarSize}
            deceased={relative.isDeceased}
          />
          <View style={styles.info}>
            <Text style={styles.name}>{displayName}</Text>
            {kinshipLabel ? (
              <KinshipBadge label={kinshipLabel} style={styles.kinshipBadge} />
            ) : null}
            <Text style={styles.birthday}>{formatBirthdayKzRu(relative)}</Text>
            {age !== null ? <Text style={styles.age}>{getAgeLabel(age)}</Text> : null}
          </View>
        </View>
      </Pressable>

      {relative.isDeceased ? (
        <View style={styles.deceasedBadge}>
          <Text style={styles.deceasedBadgeText}>🕊️ Марқұм</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={handleDetails}
          style={({ pressed }) => [
            styles.actionButton,
            styles.detailsButton,
            styles.actionButtonWide,
            !showContactAction && styles.actionButtonFull,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${displayName} профилі`}>
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={[styles.actionLabel, styles.detailsLabel]}>Профиль</Text>
        </Pressable>

        {showContactAction ? (
          <Pressable
            onPress={handleWhatsApp}
            style={({ pressed }) => [
              styles.actionButton,
              styles.whatsappButton,
              styles.actionButtonWide,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`WhatsApp ${displayName}`}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionLabel}>WhatsApp</Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.palette.white,
      borderRadius: Radius.lg,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
      borderWidth: theme.layout.cardBorderWidth,
      borderColor: theme.palette.goldLight,
      ...Shadow.card,
    },
    cardDeceased: {
      borderColor: theme.palette.creamDark,
      opacity: 0.95,
    },
    topRowPressable: {
      borderRadius: Radius.md,
      minHeight: 48,
      justifyContent: 'center',
    },
    topRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    info: {
      flex: 1,
      gap: 6,
    },
    name: {
      ...theme.typography.subtitle,
      color: theme.palette.textPrimary,
      fontWeight: '800',
      letterSpacing: 0.1,
    },
    kinshipBadge: {
      alignSelf: 'flex-start',
    },
    birthday: {
      ...theme.typography.bodySmall,
      color: theme.palette.textSecondary,
    },
    age: {
      ...theme.typography.bodySmall,
      color: theme.palette.greenMid,
      fontWeight: '800',
    },
    deceasedBadge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.palette.creamDark,
      borderRadius: Radius.full,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    deceasedBadgeText: {
      ...theme.typography.caption,
      color: theme.palette.textSecondary,
      fontWeight: '700',
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    actionButton: {
      flex: 1,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      paddingHorizontal: theme.spacing.xs,
    },
    actionButtonWide: {
      minHeight: theme.layout.buttonMinHeight,
    },
    actionButtonFull: {
      flex: 1,
    },
    whatsappButton: {
      backgroundColor: theme.palette.whatsapp,
    },
    detailsButton: {
      backgroundColor: theme.palette.creamDark,
      borderWidth: theme.elderMode ? 2 : 1.5,
      borderColor: theme.palette.goldLight,
    },
    pressed: {
      opacity: theme.elderMode ? 0.96 : 0.9,
    },
    actionIcon: {
      fontSize: theme.elderMode ? 22 : 18,
    },
    actionLabel: {
      ...theme.typography.caption,
      color: theme.palette.white,
      fontWeight: '800',
      textAlign: 'center',
    },
    detailsLabel: {
      color: theme.palette.greenDeep,
    },
  });
}
