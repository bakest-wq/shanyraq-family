import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { getRelativeInitials } from '@/utils/relative-initials';
import { Palette, Typography } from '@/constants/theme';

export type RelativeAvatarProps = {
  name: string;
  color: string;
  photoUrl?: string | null;
  size?: number;
  deceased?: boolean;
};

function blendWithWhite(hex: string, amount: number): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return hex;
  }

  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);

  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);

  const toHex = (value: number) => value.toString(16).padStart(2, '0');

  return `#${toHex(mix(red))}${toHex(mix(green))}${toHex(mix(blue))}`;
}

export function RelativeAvatar({
  name,
  color,
  photoUrl,
  size = 64,
  deceased = false,
}: RelativeAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = getRelativeInitials(name);
  const fontSize = size >= 96 ? size * 0.28 : size * 0.38;
  const showPhoto = Boolean(photoUrl) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [photoUrl]);
  const gradientTop = useMemo(() => blendWithWhite(color, 0.28), [color]);
  const gradientBottom = color;

  return (
    <View
      style={[
        styles.outerRing,
        {
          width: size + 6,
          height: size + 6,
          borderRadius: (size + 6) / 2,
        },
        deceased && styles.deceased,
      ]}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: gradientBottom,
          },
        ]}>
        {showPhoto ? (
          <Image
            source={{ uri: photoUrl! }}
            style={[styles.photo, { width: size, height: size, borderRadius: size / 2 }]}
            contentFit="cover"
            transition={180}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <>
            <View
              style={[
                styles.gradientGlow,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: gradientTop,
                },
              ]}
            />
            <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
          </>
        )}
      </View>
    </View>
  );
}

type AvatarPlaceholderProps = RelativeAvatarProps;

/** Backward-compatible alias used across the app. */
export function AvatarPlaceholder(props: AvatarPlaceholderProps) {
  return <RelativeAvatar {...props} />;
}

type AvatarLoadingOverlayProps = {
  size?: number;
};

export function AvatarLoadingOverlay({ size = 64 }: AvatarLoadingOverlayProps) {
  return (
    <View
      style={[
        styles.loadingOverlay,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}>
      <ActivityIndicator color={Palette.white} size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  outerRing: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Palette.goldLight,
    backgroundColor: Palette.cream,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.42,
  },
  photo: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  deceased: {
    opacity: 0.78,
  },
  initials: {
    color: Palette.white,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 3,
    left: 3,
    backgroundColor: 'rgba(27, 67, 50, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
