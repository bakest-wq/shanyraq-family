import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SelectSelfRelativeList } from '@/components/identity/SelectSelfRelativeList';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { QuickActionButton } from '@/components/ui/QuickActionButton';
import { FAMILY_SPACE_COPY } from '@/constants/family-space-content';
import { USER_IDENTITY_COPY } from '@/constants/user-identity-content';
import type { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Spacing, Typography } from '@/constants/theme';

type JoinFamilyIdentityStepProps = {
  relatives: Relative[];
  loadingRelatives?: boolean;
  saving?: boolean;
  onSelectExisting: (relative: Relative) => void;
  onAddSelf: () => void;
};

type Mode = 'choose' | 'existing';

export function JoinFamilyIdentityStep({
  relatives,
  loadingRelatives = false,
  saving = false,
  onSelectExisting,
  onAddSelf,
}: JoinFamilyIdentityStepProps) {
  const [mode, setMode] = useState<Mode>('choose');
  const [selectedRelative, setSelectedRelative] = useState<Relative | null>(null);

  useEffect(() => {
    setMode('choose');
    setSelectedRelative(null);
  }, [relatives]);

  if (mode === 'choose') {
    return (
      <Card goldBorder style={styles.card}>
        <Text style={styles.title}>{FAMILY_SPACE_COPY.joinIdentityTitle}</Text>
        <Text style={styles.subtitle}>{FAMILY_SPACE_COPY.joinIdentitySubtitle}</Text>
        <QuickActionButton
          icon="🌿"
          label={FAMILY_SPACE_COPY.joinExistingOption}
          sublabel={USER_IDENTITY_COPY.existingHint}
          variant="green"
          onPress={() => relatives.length > 0 && setMode('existing')}
        />
        {relatives.length === 0 && !loadingRelatives ? (
          <Text style={styles.emptyHint}>
            Шежіреде әлі туыс жоқ — өз профиліңізді қосыңыз.
          </Text>
        ) : null}
        <QuickActionButton
          icon="👤"
          label={FAMILY_SPACE_COPY.joinAddSelfOption}
          sublabel={USER_IDENTITY_COPY.addHint}
          variant="gold"
          onPress={onAddSelf}
        />
      </Card>
    );
  }

  return (
    <View style={styles.existingWrap}>
      <Card style={styles.card}>
        <Text style={styles.sectionLabel}>{USER_IDENTITY_COPY.pickSelfTitle}</Text>
        <Text style={styles.sectionHint}>{USER_IDENTITY_COPY.pickSelfHint}</Text>
        <SelectSelfRelativeList
          relatives={relatives}
          selectedId={selectedRelative?.id ?? null}
          onSelect={setSelectedRelative}
        />
      </Card>

      <PrimaryButton
        label={saving ? 'Қосылуда...' : FAMILY_SPACE_COPY.joinContinue}
        sublabel={selectedRelative ? getRelativeDisplayName(selectedRelative) : FAMILY_SPACE_COPY.joinNeedIdentity}
        variant="green"
        onPress={
          saving || !selectedRelative
            ? undefined
            : () => onSelectExisting(selectedRelative)
        }
      />

      <Pressable onPress={() => setMode('choose')} style={styles.secondaryLink}>
        <Text style={styles.secondaryLinkText}>{USER_IDENTITY_COPY.backToOptions}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
  },
  title: {
    ...Typography.subtitle,
    color: Palette.greenDeep,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  emptyHint: {
    ...Typography.caption,
    color: Palette.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  existingWrap: {
    gap: Spacing.md,
  },
  sectionLabel: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  sectionHint: {
    ...Typography.caption,
    color: Palette.textSecondary,
    lineHeight: 20,
  },
  secondaryLink: {
    alignSelf: 'center',
    paddingVertical: Spacing.sm,
  },
  secondaryLinkText: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
});
