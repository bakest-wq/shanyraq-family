import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SelectSelfRelativeList } from '@/components/identity/SelectSelfRelativeList';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { QuickActionButton } from '@/components/ui/QuickActionButton';
import { USER_IDENTITY_COPY } from '@/constants/user-identity-content';
import { useFamily } from '@/hooks/useFamily';
import { useRelatives } from '@/hooks/useRelatives';
import { useToast } from '@/hooks/useToast';
import { useRootPersonIdentity } from '@/hooks/useRootPersonIdentity';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { useSafeGoBack } from '@/hooks/useSafeGoBack';
import { APP_ROUTES } from '@/utils/safe-navigation';
import type { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Spacing, Typography } from '@/constants/theme';

type WhoAmIMode = 'choose' | 'existing';

export default function WhoAmIScreen() {
  const router = useRouter();
  const goBack = useSafeGoBack(APP_ROUTES.management);
  const { showToast } = useToast();
  const { session } = useFamily();
  const { relatives } = useRelatives();
  const { profile, myRelative, linkRelative } = useUserIdentity();
  const { resetToMe } = useRootPersonIdentity();
  const [mode, setMode] = useState<WhoAmIMode>('choose');
  const [selectedRelative, setSelectedRelative] = useState<Relative | null>(myRelative);
  const [saving, setSaving] = useState(false);

  const selectedId = selectedRelative?.id ?? profile?.relativeId ?? null;
  const canSaveExisting = Boolean(selectedRelative);

  const intro = useMemo(() => {
    if (profile && myRelative) {
      return USER_IDENTITY_COPY.currentLinked(getRelativeDisplayName(myRelative));
    }

    return USER_IDENTITY_COPY.intro;
  }, [myRelative, profile]);

  const handleSaveExisting = async () => {
    if (!selectedRelative || saving) {
      return;
    }

    setSaving(true);

    try {
      await linkRelative(selectedRelative.id, session?.ownerName);
      resetToMe();
      showToast({
        type: 'success',
        title: USER_IDENTITY_COPY.savedTitle,
        message: USER_IDENTITY_COPY.savedMessage(getRelativeDisplayName(selectedRelative)),
      });
      goBack();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Қате · Ошибка',
        message: error instanceof Error ? error.message : 'Сақтау сәтсіз аяқталды',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSelf = () => {
    router.push({
      pathname: '/add-relative',
      params: {
        relationship: 'Мен',
        linkAsUser: '1',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Pressable onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>← Артқа</Text>
        </Pressable>

        <Text style={styles.title}>{USER_IDENTITY_COPY.screenTitle}</Text>
        <Text style={styles.subtitle}>{intro}</Text>

        {mode === 'choose' ? (
          <Card goldBorder style={styles.card}>
            <QuickActionButton
              icon="🌿"
              label={USER_IDENTITY_COPY.existingOption}
              sublabel={USER_IDENTITY_COPY.existingHint}
              variant="green"
              onPress={() => setMode('existing')}
            />
            <QuickActionButton
              icon="👤"
              label={USER_IDENTITY_COPY.addOption}
              sublabel={USER_IDENTITY_COPY.addHint}
              variant="gold"
              onPress={handleAddSelf}
            />
          </Card>
        ) : (
          <View style={styles.existingWrap}>
            <Card style={styles.card}>
              <Text style={styles.sectionLabel}>{USER_IDENTITY_COPY.pickSelfTitle}</Text>
              <Text style={styles.sectionHint}>{USER_IDENTITY_COPY.pickSelfHint}</Text>
              <SelectSelfRelativeList
                relatives={relatives}
                selectedId={selectedId}
                onSelect={setSelectedRelative}
              />
            </Card>

            <PrimaryButton
              label={saving ? 'Сақталуда...' : USER_IDENTITY_COPY.saveButton}
              sublabel={USER_IDENTITY_COPY.saveHint}
              variant="green"
              onPress={saving || !canSaveExisting ? undefined : () => void handleSaveExisting()}
            />

            <Pressable onPress={() => setMode('choose')} style={styles.secondaryLink}>
              <Text style={styles.secondaryLinkText}>{USER_IDENTITY_COPY.backToOptions}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.cream,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingTop: Spacing.sm,
  },
  backText: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  title: {
    ...Typography.hero,
    color: Palette.greenDeep,
  },
  subtitle: {
    ...Typography.body,
    color: Palette.textSecondary,
    lineHeight: 24,
  },
  card: {
    gap: Spacing.md,
  },
  existingWrap: {
    flex: 1,
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
