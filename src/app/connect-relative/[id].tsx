import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RelativeLinkPicker } from '@/components/relatives/RelativeLinkPicker';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { useConnectParents, useRelative, useRelatives } from '@/hooks/useRelatives';
import { useSafeGoBack } from '@/hooks/useSafeGoBack';
import { APP_ROUTES } from '@/utils/safe-navigation';
import { validateRelativeBeforeSave } from '@/services/graph-integrity.service';
import {
  buildFamilyLinkCandidates,
  validateFamilyLinksFull,
} from '@/utils/family-link-validation';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function ConnectRelativeScreen() {
  const router = useRouter();
  const goBack = useSafeGoBack(APP_ROUTES.relatives);
  const { id } = useLocalSearchParams<{ id: string }>();
  const relativeId = Array.isArray(id) ? id[0] : id;
  const { relative, loading } = useRelative(relativeId ?? '');
  const { relatives } = useRelatives();
  const { connectParents, saving, error: saveError } = useConnectParents(relativeId ?? '');

  const [fatherId, setFatherId] = useState<string | null>(null);
  const [motherId, setMotherId] = useState<string | null>(null);
  const [linkErrors, setLinkErrors] = useState<{
    fatherId?: string;
    motherId?: string;
  }>({});

  useEffect(() => {
    if (relative) {
      setFatherId(relative.fatherId ?? null);
      setMotherId(relative.motherId ?? null);
    }
  }, [relative]);

  const linkValues = useMemo(
    () => ({
      fatherId,
      motherId,
    }),
    [fatherId, motherId],
  );

  const fatherCandidates = useMemo(
    () =>
      buildFamilyLinkCandidates(relatives, 'father', {
        subjectId: relativeId,
        subjectGender: relative?.gender,
        links: linkValues,
      }),
    [relatives, relativeId, relative?.gender, linkValues],
  );

  const motherCandidates = useMemo(
    () =>
      buildFamilyLinkCandidates(relatives, 'mother', {
        subjectId: relativeId,
        subjectGender: relative?.gender,
        links: linkValues,
      }),
    [relatives, relativeId, relative?.gender, linkValues],
  );

  const linkValidation = useMemo(() => {
    if (!relativeId || !relative) {
      return { errors: {}, warnings: {} };
    }

    return validateFamilyLinksFull(linkValues, {
      relativeId,
      relatives,
      subjectGender: relative.gender,
    });
  }, [linkValues, relative, relativeId, relatives]);

  const handleSave = async () => {
    if (!relativeId || !relative) {
      return;
    }

    const { errors: nextErrors } = validateFamilyLinksFull(linkValues, {
      relativeId,
      relatives,
      subjectGender: relative.gender,
    });

    const integrity = validateRelativeBeforeSave(
      {
        fullName: relative.fullName,
        firstName: relative.firstName,
        relationship: relative.relationship,
        birthday: relative.birthday,
        fatherId,
        motherId,
        spouseId: relative.spouseId,
        gender: relative.gender,
      },
      relatives,
      { relativeId, relatives, subjectGender: relative.gender },
    );

    const mergedErrors = { ...nextErrors, ...integrity.errors };
    setLinkErrors(mergedErrors);

    if (Object.keys(mergedErrors).length > 0) {
      return;
    }

    if (!fatherId && !motherId) {
      Alert.alert(
        'Байланыс жоқ',
        'Кем дегенде әke немесе ana таңдаңыз · Select at least one parent.',
      );
      return;
    }

    const updated = await connectParents({ fatherId, motherId });

    if (updated) {
      Alert.alert('Сақталды · Saved', 'Байланыс жаңартылды · Links updated.', [
        { text: 'Жарайды', onPress: goBack },
      ]);
    }
  };

  if (!relativeId) {
    return null;
  }

  if (loading && !relative) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState message="Жүктелуде..." />
      </SafeAreaView>
    );
  }

  if (!relative) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>Туыс табылмады · Relative not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>← Артқа</Text>
        </Pressable>

        <Text style={styles.title}>Туыс байлау</Text>
        <Text style={styles.subtitle}>Connect to parents · ата-ана таңдау</Text>

        <Card goldBorder style={styles.helperCard}>
          <Text style={styles.helperText}>
            Бір ата-ана бірнеше балаға байланыса алады. Балаға әke мен ana таңдаңыз — шежіреде
            отбасы блогы автоматты түрде пайда болады.
          </Text>
        </Card>

        <Card goldBorder style={styles.childCard}>
          <AvatarPlaceholder
            name={relative.fullName}
            color={relative.avatarColor}
            photoUrl={relative.photoUrl}
            size={64}
          />
          <Text style={styles.childName}>{relative.fullName}</Text>
          <Text style={styles.childRole}>{relative.relationship}</Text>
        </Card>

        <Card style={styles.linkCard}>
          <RelativeLinkPicker
            linkType="father"
            selectedId={fatherId}
            candidates={fatherCandidates}
            relatives={relatives}
            subjectId={relativeId}
            subjectGender={relative.gender}
            links={linkValues}
            error={linkErrors.fatherId}
            warning={!linkErrors.fatherId ? linkValidation.warnings.fatherId : undefined}
            onSelect={(id) => {
              setFatherId(id);
              setLinkErrors((current) => ({ ...current, fatherId: undefined }));
            }}
          />
          <RelativeLinkPicker
            linkType="mother"
            selectedId={motherId}
            candidates={motherCandidates}
            relatives={relatives}
            subjectId={relativeId}
            subjectGender={relative.gender}
            links={linkValues}
            error={linkErrors.motherId}
            warning={!linkErrors.motherId ? linkValidation.warnings.motherId : undefined}
            onSelect={(id) => {
              setMotherId(id);
              setLinkErrors((current) => ({ ...current, motherId: undefined }));
            }}
          />
        </Card>

        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

        <PrimaryButton
          label={saving ? 'Сақталуда...' : 'Байланысты сақтау · Save links'}
          sublabel="Шежіреге қосу"
          variant="green"
          onPress={saving ? undefined : () => void handleSave()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.cream,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
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
  },
  helperCard: {
    backgroundColor: Palette.creamDark,
  },
  helperText: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  childCard: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  childName: {
    ...Typography.subtitle,
    color: Palette.textPrimary,
    textAlign: 'center',
  },
  childRole: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
  },
  linkCard: {
    gap: Spacing.lg,
  },
  errorText: {
    ...Typography.caption,
    color: Palette.danger,
    fontWeight: '600',
    textAlign: 'center',
  },
});
