import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ShezhireHealthCheckPanel } from '@/components/integrity/ShezhireHealthCheckPanel';
import { HEALTH_CHECK_COPY } from '@/constants/health-check-content';
import { useSafeGoBack } from '@/hooks/useSafeGoBack';
import { APP_ROUTES } from '@/utils/safe-navigation';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function ShezhireHealthCheckScreen() {
  const goBack = useSafeGoBack(APP_ROUTES.management);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>← Артқа</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>{HEALTH_CHECK_COPY.title}</Text>
          <Text style={styles.subtitle}>{HEALTH_CHECK_COPY.subtitle}</Text>
        </View>

        <ShezhireHealthCheckPanel />
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
  header: {
    gap: Spacing.xs,
  },
  title: {
    ...Typography.hero,
    color: Palette.greenDeep,
  },
  subtitle: {
    ...Typography.body,
    color: Palette.textSecondary,
    lineHeight: 22,
  },
});
