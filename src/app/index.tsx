import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { LoadingState } from '@/components/ui/LoadingState';
import { Palette } from '@/constants/theme';
import { useFamily } from '@/hooks/useFamily';

export default function RootIndex() {
  const { isReady, hasFamily } = useFamily();

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: Palette.cream, justifyContent: 'center' }}>
        <LoadingState message="Shanyraq жүктелуде..." />
      </View>
    );
  }

  if (hasFamily) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}
