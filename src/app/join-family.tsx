import { useRouter } from 'expo-router';
import { useState } from 'react';
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

import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useFamily } from '@/hooks/useFamily';
import { FamilySession } from '@/types/family';
import { formatInviteCodeDisplay, normalizeInviteCode } from '@/utils/family-invite';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function JoinFamilyScreen() {
  const router = useRouter();
  const { joinFamily } = useFamily();
  const [inviteCode, setInviteCode] = useState('');
  const [memberName, setMemberName] = useState('');
  const [errors, setErrors] = useState<{ inviteCode?: string; memberName?: string }>({});
  const [saving, setSaving] = useState(false);
  const [joinedSession, setJoinedSession] = useState<FamilySession | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleJoin = async () => {
    const nextErrors: { inviteCode?: string; memberName?: string } = {};

    if (!inviteCode.trim()) {
      nextErrors.inviteCode = 'Введите код приглашения.';
    }

    if (!memberName.trim()) {
      nextErrors.memberName = 'Введите ваше имя.';
    }

    setErrors(nextErrors);
    setNotFound(false);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);

    try {
      const session = await joinFamily({
        inviteCode: inviteCode.trim(),
        memberName: memberName.trim(),
      });

      if (!session) {
        setNotFound(true);
        return;
      }

      setJoinedSession(session);
    } finally {
      setSaving(false);
    }
  };

  if (joinedSession) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.successContainer}>
          <View style={styles.successIconWrap}>
            <Text style={styles.successIcon}>🤲</Text>
          </View>
          <Text style={styles.successTitle}>Қош келдіңіз!</Text>
          <Text style={styles.successSubtitle}>Вы присоединились к семье</Text>

          <Card goldBorder style={styles.successCard}>
            <Text style={styles.successFamilyName}>{joinedSession.familyName}</Text>
            <Text style={styles.successMeta}>
              Код: {formatInviteCodeDisplay(joinedSession.inviteCode)}
            </Text>
            <Text style={styles.successMeta}>Сіз: {joinedSession.ownerName}</Text>
          </Card>

          <Text style={styles.successMessage}>
            Ассалаумағалейкум! Теперь вы в семейном шежире — родственники, календарь и архив
            доступны только для вашей семьи.
          </Text>

          <PrimaryButton
            label="Кіру · Открыть семью"
            sublabel="Shanyraq Family"
            variant="green"
            onPress={() => router.replace('/(tabs)')}
          />
        </View>
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
          <Text style={styles.title}>Присоединиться к семье</Text>
          <Text style={styles.subtitle}>Шақыру коды · Invite code</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Card style={styles.noteCard}>
            <Text style={styles.noteGreeting}>Ассалаумағалейкум!</Text>
            <Text style={styles.noteText}>
              Попросите код у владельца семьи. Пример: SHA123, ATA777, URP456.
            </Text>
          </Card>

          <FormField
            label="Код приглашения *"
            placeholder="SHA123"
            value={inviteCode}
            onChangeText={(value) => {
              setInviteCode(normalizeInviteCode(value));
              setErrors((current) => ({ ...current, inviteCode: undefined }));
              setNotFound(false);
            }}
            error={errors.inviteCode}
            autoCapitalize="characters"
            hint="6 символов · буквы и цифры"
          />

          <FormField
            label="Сіздің атыңыз · Ваше имя *"
            placeholder="Мысалы: Айгуль"
            value={memberName}
            onChangeText={(value) => {
              setMemberName(value);
              setErrors((current) => ({ ...current, memberName: undefined }));
            }}
            error={errors.memberName}
            autoCapitalize="words"
          />

          {notFound ? (
            <Card style={styles.errorCard}>
              <Text style={styles.errorTitle}>Код не найден</Text>
              <Text style={styles.errorText}>
                Проверьте код и попробуйте снова. Если семья создана на другом телефоне, код
                должен совпадать с тем, что отправил владелец.
              </Text>
            </Card>
          ) : null}

          <PrimaryButton
            label={saving ? 'Подключение...' : 'Присоединиться'}
            sublabel="Отбасыға қосылу"
            variant="gold"
            onPress={saving ? undefined : () => void handleJoin()}
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
  successFamilyName: {
    ...Typography.subtitle,
    color: Palette.textPrimary,
    textAlign: 'center',
  },
  successMeta: {
    ...Typography.bodySmall,
    color: Palette.gold,
    fontWeight: '700',
    textAlign: 'center',
  },
  successMessage: {
    ...Typography.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
});
