import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ShezhireHealthCheckPanel } from '@/components/integrity/ShezhireHealthCheckPanel';
import { GRAPH_INTEGRITY_COPY } from '@/constants/graph-integrity-content';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function ShezhireHealthCheckScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Артқа</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>{GRAPH_INTEGRITY_COPY.healthCheckTitle}</Text>
          <Text style={styles.subtitle}>{GRAPH_INTEGRITY_COPY.healthCheckSubtitle}</Text>
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
