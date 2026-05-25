import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TIMELINE_COPY } from '@/constants/timeline-content';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function AddTimelineEventScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/timeline');
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrap}>
        <Text style={styles.title}>{TIMELINE_COPY.screenTitle}</Text>
        <Text style={styles.subtitle}>{TIMELINE_COPY.screenSubtitle}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.cream,
  },
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  title: {
    ...Typography.subtitle,
    color: Palette.greenDeep,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
