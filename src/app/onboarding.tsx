import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useFamily } from '@/hooks/useFamily';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  const { hasFamily, isReady } = useFamily();

  if (!isReady) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState message="Shanyraq жүктелуде..." />
      </SafeAreaView>
    );
  }

  if (hasFamily) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <Text style={styles.logo}>🏠</Text>
          </View>
          <Text style={styles.title}>Shanyraq Family</Text>
          <Text style={styles.subtitle}>Шаңырақ · Семейный очаг</Text>
        </View>

        <Card goldBorder style={styles.introCard}>
          <Text style={styles.introTitle}>Отбасыңыздың жеке орны</Text>
          <Text style={styles.introText}>
            Храните родственников, дни рождения, семейное дерево и архив воспоминаний — только для
            вашей семьи.
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>👨‍👩‍👧‍👦 Туыстар · Родственники</Text>
            <Text style={styles.featureItem}>📅 Туған күндер · Дни рождения</Text>
            <Text style={styles.featureItem}>🌳 Шежіре · Семейное дерево</Text>
            <Text style={styles.featureItem}>📚 Архив · Воспоминания</Text>
          </View>
        </Card>

        <View style={styles.actions}>
          <PrimaryButton
            label="Создать семью"
            sublabel="Жаңа отбасы · Start your family"
            variant="green"
            onPress={() => router.push('/create-family')}
          />
          <PrimaryButton
            label="Присоединиться к семье"
            sublabel="Код шақыру · Join with invite code"
            variant="gold"
            onPress={() => router.push('/join-family')}
          />
        </View>
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
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
    justifyContent: 'center',
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: Palette.greenDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 42,
  },
  title: {
    ...Typography.hero,
    color: Palette.greenDeep,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
  introCard: {
    gap: Spacing.md,
  },
  introTitle: {
    ...Typography.subtitle,
    color: Palette.textPrimary,
  },
  introText: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    lineHeight: 24,
  },
  featureList: {
    gap: Spacing.sm,
  },
  featureItem: {
    ...Typography.bodySmall,
    color: Palette.greenMid,
    fontWeight: '600',
  },
  actions: {
    gap: Spacing.sm,
  },
});
