import { Redirect } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SetupOnboardingFlow } from '@/components/onboarding/SetupOnboardingFlow';
import { LoadingState } from '@/components/ui/LoadingState';
import { Palette } from '@/constants/theme';
import { useFamily } from '@/hooks/useFamily';
import { useSetupOnboarding } from '@/hooks/useSetupOnboarding';

export default function SetupOnboardingScreen() {
  const { hasFamily, isReady: familyReady } = useFamily();
  const { isCompleted, isReady: onboardingReady } = useSetupOnboarding();

  if (!familyReady || !onboardingReady) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState message="Дайындалуда..." />
      </SafeAreaView>
    );
  }

  if (!hasFamily) {
    return <Redirect href="/onboarding" />;
  }

  if (isCompleted) {
    return <Redirect href="/(tabs)" />;
  }

  return <SetupOnboardingFlow />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.cream,
    justifyContent: 'center',
  },
});
