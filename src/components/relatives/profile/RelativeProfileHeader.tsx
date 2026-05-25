import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AvatarLoadingOverlay,
  RelativeAvatar,
} from '@/components/ui/RelativeAvatar';
import { Card } from '@/components/ui/Card';
import { KinshipBadge } from '@/components/ui/KinshipBadge';
import { FadeTransition } from '@/components/ui/motion/FadeTransition';
import { RELATIVE_PROFILE_COPY } from '@/constants/relative-profile-content';
import { useAppTheme } from '@/hooks/useElderMode';
import { Relative } from '@/types/relative';
import {
  formatProfileAgeLine,
  formatProfileBirthday,
  getShortFamilyInfo,
} from '@/utils/relative-profile';
import { Palette, Radius } from '@/constants/theme';

type RelativeProfileHeaderProps = {
  relative: Relative;
  displayName: string;
  kinshipLabel?: string | null;
  kinshipMemoryLine?: string | null;
  kinshipDetail?: string | null;
  familySummaries?: string[];
  uploading?: boolean;
  onPickPhoto?: () => void;
  onRemovePhoto?: () => void;
};

export function RelativeProfileHeader({
  relative,
  displayName,
  kinshipLabel,
  kinshipMemoryLine,
  kinshipDetail,
  familySummaries = [],
  uploading = false,
  onPickPhoto,
  onRemovePhoto,
}: RelativeProfileHeaderProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const birthday = formatProfileBirthday(relative);
  const ageLine = formatProfileAgeLine(relative);
  const familyInfo = getShortFamilyInfo(relative);
  const hasPhoto = Boolean(relative.photoUrl);
  const avatarSize = theme.elderMode ? 132 : 120;

  return (
    <FadeTransition transitionKey={relative.id}>
      <Card goldBorder style={styles.card}>
        <View style={styles.avatarWrap}>
          <Pressable
            onPress={onPickPhoto && !uploading ? onPickPhoto : undefined}
            style={styles.avatarPressable}
            accessibilityRole={onPickPhoto ? 'button' : undefined}
            accessibilityLabel={
              hasPhoto ? RELATIVE_PROFILE_COPY.photo.change : RELATIVE_PROFILE_COPY.photo.add
            }>
            <View style={styles.avatarInner}>
              <RelativeAvatar
                name={displayName}
                color={relative.avatarColor}
                photoUrl={relative.photoUrl}
                size={avatarSize}
                deceased={relative.isDeceased}
              />
              {uploading ? <AvatarLoadingOverlay size={avatarSize} /> : null}
            </View>
          </Pressable>
          {onPickPhoto ? (
            <Text style={styles.photoHint}>
              {hasPhoto ? RELATIVE_PROFILE_COPY.photo.change : RELATIVE_PROFILE_COPY.photo.add}
            </Text>
          ) : null}
          {hasPhoto && onRemovePhoto ? (
            <Pressable
              onPress={uploading ? undefined : onRemovePhoto}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={RELATIVE_PROFILE_COPY.photo.remove}>
              <Text style={styles.photoRemove}>{RELATIVE_PROFILE_COPY.photo.remove}</Text>
            </Pressable>
          ) : null}
        </View>

        {relative.isDeceased ? (
          <View style={styles.deceasedBadge}>
            <Text style={styles.deceasedBadgeText}>🕊️ {RELATIVE_PROFILE_COPY.deceased}</Text>
          </View>
        ) : null}

        <Text style={styles.name} accessibilityRole="header">
          {displayName}
        </Text>

        {kinshipLabel ? <KinshipBadge label={kinshipLabel} /> : null}

        {kinshipMemoryLine ? (
          <Text style={styles.kinshipMemoryLine}>{kinshipMemoryLine}</Text>
        ) : null}

        {familySummaries.length > 0 ? (
          <View style={styles.summaryWrap}>
            {familySummaries.map((summary) => (
              <Text key={summary} style={styles.summaryLine}>
                {summary}
              </Text>
            ))}
          </View>
        ) : null}

        {kinshipDetail ? <Text style={styles.kinshipDetail}>{kinshipDetail}</Text> : null}

        <View style={styles.metaBlock}>
          {birthday || ageLine ? (
            <Text style={styles.metaLine}>
              {[birthday, ageLine].filter(Boolean).join(' · ')}
            </Text>
          ) : (
            <Text style={styles.metaMuted}>{RELATIVE_PROFILE_COPY.empty.birthday}</Text>
          )}
          {familyInfo ? (
            <Text style={styles.metaLineMuted}>{familyInfo}</Text>
          ) : null}
        </View>
      </Card>
    </FadeTransition>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    card: {
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xl,
    },
    avatarWrap: {
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    avatarPressable: {
      alignItems: 'center',
    },
    avatarInner: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoHint: {
      ...theme.typography.caption,
      color: theme.palette.greenDeep,
      fontWeight: '700',
      marginTop: theme.spacing.xs,
    },
    photoRemove: {
      ...theme.typography.caption,
      color: theme.palette.textMuted,
      fontWeight: '600',
    },
    deceasedBadge: {
      backgroundColor: theme.palette.creamDark,
      borderRadius: Radius.full,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    deceasedBadgeText: {
      ...theme.typography.caption,
      color: theme.palette.textSecondary,
      fontWeight: '700',
    },
    name: {
      fontSize: theme.elderMode ? 36 : 32,
      lineHeight: theme.elderMode ? 44 : 40,
      fontWeight: '800',
      color: theme.palette.greenDeep,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
      flexShrink: 1,
      flexWrap: 'wrap',
    },
    kinshipMemoryLine: {
      ...theme.typography.bodySmall,
      color: theme.palette.greenMid,
      textAlign: 'center',
      fontWeight: '600',
      lineHeight: 22,
      paddingHorizontal: theme.spacing.md,
      fontStyle: 'italic',
    },
    summaryWrap: {
      gap: 4,
      paddingHorizontal: theme.spacing.md,
    },
    summaryLine: {
      ...theme.typography.bodySmall,
      color: theme.palette.greenMid,
      textAlign: 'center',
      fontWeight: '600',
      lineHeight: 22,
    },
    kinshipDetail: {
      ...theme.typography.caption,
      color: theme.palette.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: theme.spacing.md,
    },
    metaBlock: {
      width: '100%',
      marginTop: theme.spacing.sm,
      gap: theme.spacing.xs,
      backgroundColor: theme.palette.cream,
      borderRadius: Radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    metaLine: {
      ...theme.typography.bodySmall,
      color: theme.palette.textPrimary,
      textAlign: 'center',
      lineHeight: 22,
    },
    metaLineMuted: {
      ...theme.typography.caption,
      color: theme.palette.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    metaMuted: {
      ...theme.typography.caption,
      color: theme.palette.textMuted,
      textAlign: 'center',
    },
  });
}
