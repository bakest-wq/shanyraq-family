import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { JoinFamilyIdentityStep } from '@/components/identity/JoinFamilyIdentityStep';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useFamily } from '@/hooks/useFamily';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { isSupabaseReady } from '@/lib/supabase';
import { relativesService } from '@/services/relatives.service';
import { userIdentityService } from '@/services/user-identity.service';
import type { JoinFamilyPreview } from '@/types/family';
import type { Relative } from '@/types/relative';
import { formatInviteCodeDisplay, normalizeInviteCode } from '@/utils/family-invite';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Spacing, Typography } from '@/constants/theme';

type JoinStep = 'code' | 'identity' | 'success';

export default function JoinFamilyScreen() {
  const router = useRouter();
  const { resolveInviteCode, finalizeJoin } = useFamily();
  const { linkRelative } = useUserIdentity();
  const [step, setStep] = useState<JoinStep>('code');
  const [inviteCode, setInviteCode] = useState('');
  const [errors, setErrors] = useState<{ inviteCode?: string }>({});
  const [saving, setSaving] = useState(false);
  const [loadingRelatives, setLoadingRelatives] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [preview, setPreview] = useState<JoinFamilyPreview | null>(null);
  const [relatives, setRelatives] = useState<Relative[]>([]);
  const [joinedFamilyName, setJoinedFamilyName] = useState('');

  useEffect(() => {
    if (!preview || !isSupabaseReady()) {
      setRelatives([]);
      return;
    }

    setLoadingRelatives(true);
    void relativesService
      .getAll(preview.familyId)
      .then(setRelatives)
      .catch(() => setRelatives([]))
      .finally(() => setLoadingRelatives(false));
  }, [preview]);

  const handleResolveCode = async () => {
    if (!inviteCode.trim()) {
      setErrors({ inviteCode: 'Шақыру кодын енгізіңіз.' });
      return;
    }

    setSaving(true);
    setNotFound(false);
    setErrors({});

    try {
      const nextPreview = await resolveInviteCode({ inviteCode: inviteCode.trim() });

      if (!nextPreview) {
        setNotFound(true);
        return;
      }

      setPreview(nextPreview);
      setStep('identity');
    } finally {
      setSaving(false);
    }
  };

  const completeJoin = async (relative: Relative | null, displayName: string) => {
    if (!preview || saving) {
      return;
    }

    setSaving(true);

    try {
      const session = await finalizeJoin({
        familyId: preview.familyId,
        familyName: preview.familyName,
        inviteCode: preview.inviteCode,
        displayName,
        relativeId: relative?.id ?? null,
      });

      if (relative) {
        await userIdentityService.saveProfile({
          familyId: session.familyId,
          relativeId: relative.id,
          userName: displayName,
        });
        await linkRelative(relative.id, displayName);
      }

      setJoinedFamilyName(session.familyName);
      setStep('success');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectExisting = (relative: Relative) => {
    void completeJoin(relative, getRelativeDisplayName(relative));
  };

  const handleAddSelf = async () => {
    if (!preview || saving) {
      return;
    }

    setSaving(true);

    try {
      await finalizeJoin({
        familyId: preview.familyId,
        familyName: preview.familyName,
        inviteCode: preview.inviteCode,
        displayName: 'Мен',
      });

      router.replace({
        pathname: '/add-relative',
        params: {
          relationship: 'Мен',
          linkAsUser: '1',
          fromSetup: '1',
        },
      });
    } finally {
      setSaving(false);
    }
  };

  if (step === 'success') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.successContainer}>
          <View style={styles.successIconWrap}>
            <Text style={styles.successIcon}>🌿</Text>
          </View>
          <Text style={styles.successTitle}>Қош келдіңіз!</Text>
          <Text style={styles.successSubtitle}>Сіз отбасы орнына қосылдыңыз</Text>

          <Card goldBorder style={styles.successCard}>
            <Text style={styles.successFamilyLabel}>Отбасы орны</Text>
            <Text style={styles.successFamilyName}>{joinedFamilyName}</Text>
          </Card>

          <Text style={styles.successMessage}>
            Ассалаумағалейкум! Біз отбасымыздың шежіресін жинап жатырмыз — туған күндер мен
            туыстық байланыстарды бірге сақтайық.
          </Text>

          <PrimaryButton
            label="Кіру · Открыть отбасы"
            sublabel="Shanyraq Family"
            variant="green"
            onPress={() => router.replace('/setup-onboarding')}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'identity' && preview) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              setStep('code');
              setPreview(null);
            }}
            style={styles.backButton}>
            <Text style={styles.backText}>← Артқа</Text>
          </Pressable>
          <Text style={styles.title}>Сіз кімсіз?</Text>
          <Text style={styles.subtitle}>{preview.familyName} · шежіре профилі</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Card goldBorder style={styles.noteCard}>
            <Text style={styles.noteGreeting}>Отбасы табылды</Text>
            <Text style={styles.noteText}>
              Шақыру коды: {formatInviteCodeDisplay(preview.inviteCode)}
            </Text>
          </Card>

          {loadingRelatives ? <LoadingState message="Шежіре жүктелуде..." /> : null}

          <JoinFamilyIdentityStep
            relatives={relatives}
            loadingRelatives={loadingRelatives}
            saving={saving}
            onSelectExisting={handleSelectExisting}
            onAddSelf={() => void handleAddSelf()}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Артқа</Text>
          </Pressable>
          <Text style={styles.title}>Отбасыға қосылу</Text>
          <Text style={styles.subtitle}>Join family · шақыру коды</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Card goldBorder style={styles.noteCard}>
            <Text style={styles.noteGreeting}>Ассалаумағалейкум!</Text>
            <Text style={styles.noteText}>
              Біз отбасымыздың шежіресін жинап жатырмыз 🌿 Қосылып, туған күндер мен туыстық
              байланыстарды бірге сақтайық.
            </Text>
            <Text style={styles.noteHint}>
              Отбасы иесінен шақыру кодын сұраңыз. Мысалы: SHA123, ATA777.
            </Text>
          </Card>

          <FormField
            label="Шақыру коды · Invite code *"
            placeholder="SHA123"
            value={inviteCode}
            onChangeText={(value) => {
              setInviteCode(normalizeInviteCode(value));
              setErrors((current) => ({ ...current, inviteCode: undefined }));
              setNotFound(false);
            }}
            error={errors.inviteCode}
            autoCapitalize="characters"
            hint="6 таңба · әріптер мен сандар"
          />

          {notFound ? (
            <Card style={styles.errorCard}>
              <Text style={styles.errorTitle}>Код табылмады</Text>
              <Text style={styles.errorText}>
                Кодты қайта тексеріңіз. Отбасы басқа телефонда құрылған болса, ие жіберген код
                дәл сондай болуы керек.
              </Text>
            </Card>
          ) : null}

          <PrimaryButton
            label={saving ? 'Тексерілуде...' : 'Кодты тексеру · Continue'}
            sublabel="Код табылса, «Сіз кімсіз?» қадамына өтесіз"
            variant="gold"
            onPress={saving ? undefined : () => void handleResolveCode()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.cream,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  noteCard: {
    backgroundColor: Palette.creamDark,
    gap: Spacing.sm,
  },
  noteGreeting: {
    ...Typography.subtitle,
    color: Palette.greenDeep,
  },
  noteText: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    lineHeight: 24,
  },
  noteHint: {
    ...Typography.caption,
    color: Palette.greenMid,
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: '#FFF1E8',
    gap: Spacing.xs,
  },
  errorTitle: {
    ...Typography.bodySmall,
    color: Palette.danger,
    fontWeight: '700',
  },
  errorText: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    lineHeight: 24,
  },
  successContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    justifyContent: 'center',
    gap: Spacing.lg,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  successIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Palette.greenDeep,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  successIcon: {
    fontSize: 40,
  },
  successTitle: {
    ...Typography.hero,
    color: Palette.greenDeep,
    textAlign: 'center',
  },
  successSubtitle: {
    ...Typography.body,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
  successCard: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  successFamilyLabel: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  successFamilyName: {
    ...Typography.subtitle,
    color: Palette.textPrimary,
    textAlign: 'center',
  },
  successMessage: {
    ...Typography.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
});
