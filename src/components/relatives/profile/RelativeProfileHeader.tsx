import { StyleSheet, Text, View } from 'react-native';

import {
  AvatarLoadingOverlay,
  RelativeAvatar,
} from '@/components/ui/RelativeAvatar';
import { RelativeRelationshipBadges } from '@/components/relatives/RelativeRelationshipBadges';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Card } from '@/components/ui/Card';
import { Relative } from '@/types/relative';
import { getShezhireHeaderLine } from '@/utils/relative-profile';
import { getRelationshipLabel } from '@/utils/relationship-presets';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type RelativeProfileHeaderProps = {
  relative: Relative;
  relatives: Relative[];
  displayName: string;
  kinshipSubtitle?: string | null;
  uploading?: boolean;
  onPickPhoto?: () => void;
  onRemovePhoto?: () => void;
};

export function RelativeProfileHeader({
  relative,
  relatives,
  displayName,
  kinshipSubtitle,
  uploading = false,
  onPickPhoto,
  onRemovePhoto,
}: RelativeProfileHeaderProps) {
  const shezhireLine = getShezhireHeaderLine(relative);
  const hasPhoto = Boolean(relative.photoUrl);

  return (
    <Card goldBorder style={styles.card}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatarInner}>
          <RelativeAvatar
            name={displayName}
            color={relative.avatarColor}
            photoUrl={relative.photoUrl}
            size={112}
            deceased={relative.isDeceased}
          />
          {uploading ? <AvatarLoadingOverlay size={112} /> : null}
        </View>

        {onPickPhoto ? (
          <View style={styles.photoActions}>
            <PrimaryButton
              label={hasPhoto ? 'Фотоны өзгерту · Change' : 'Фото қосу · Add photo'}
              sublabel={uploading ? 'Жүктелуде...' : 'Галереядан таңдау'}
              variant="green"
              onPress={uploading ? undefined : onPickPhoto}
            />
            {hasPhoto && onRemovePhoto ? (
              <PrimaryButton
                label="Фотоны алу · Remove"
                sublabel="Жою · Delete photo"
                variant="gold"
                onPress={uploading ? undefined : onRemovePhoto}
              />
            ) : null}
          </View>
        ) : null}

        {relative.isDeceased ? (
          <View style={styles.deceasedBadge}>
            <Text style={styles.deceasedBadgeText}>🕊️ Марқұм</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.relationshipBadge}>
        <Text style={styles.relationshipText}>{getRelationshipLabel(relative.relationship)}</Text>
      </View>

      <RelativeRelationshipBadges relative={relative} relatives={relatives} />

      <Text style={styles.name}>{displayName}</Text>

      {kinshipSubtitle ? <Text style={styles.kinshipPath}>{kinshipSubtitle}</Text> : null}

      {shezhireLine ? (
        <View style={styles.shezhireLineWrap}>
          <Text style={styles.shezhireLine}>{shezhireLine}</Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
    ...Shadow.card,
  },
  avatarWrap: {
    alignItems: 'center',
    gap: Spacing.md,
    width: '100%',
  },
  avatarInner: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActions: {
    width: '100%',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  deceasedBadge: {
    backgroundColor: Palette.creamDark,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  deceasedBadgeText: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '700',
  },
  relationshipBadge: {
    marginTop: Spacing.sm,
    backgroundColor: '#F4EFE4',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.goldLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  relationshipText: {
    ...Typography.caption,
    color: Palette.gold,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  name: {
    ...Typography.hero,
    color: Palette.greenDeep,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  kinshipPath: {
    ...Typography.bodySmall,
    color: Palette.greenMid,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 24,
    paddingHorizontal: Spacing.sm,
  },
  shezhireLineWrap: {
    marginTop: Spacing.xs,
    backgroundColor: Palette.cream,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  shezhireLine: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
});
