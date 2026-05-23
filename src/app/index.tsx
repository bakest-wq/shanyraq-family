import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { LoadingState } from '@/components/ui/LoadingState';
import { Palette } from '@/constants/theme';
import { useFamily } from '@/hooks/useFamily';
import { useSetupOnboarding } from '@/hooks/useSetupOnboarding';

export default function RootIndex() {
  const { isReady: familyReady, hasFamily } = useFamily();
  const { isReady: onboardingReady, isCompleted } = useSetupOnboarding();

  if (!familyReady || !onboardingReady) {
    return (
      <View style={{ flex: 1, backgroundColor: Palette.cream, justifyContent: 'center' }}>
        <LoadingState message="Shanyraq жүктелуде..." />
      </View>
    );
  }

  if (!hasFamily) {
    return <Redirect href="/onboarding" />;
  }

  if (!isCompleted) {
    return <Redirect href="/setup-onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
