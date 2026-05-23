import { Redirect, Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { LoadingState } from '@/components/ui/LoadingState';
import { Palette, Typography } from '@/constants/theme';
import { useFamily } from '@/hooks/useFamily';
import { useSetupOnboarding } from '@/hooks/useSetupOnboarding';
import { useRefreshRelativesOnFocus } from '@/hooks/useRelatives';

type TabIconProps = {
  emoji: string;
  focused: boolean;
  label: string;
};

function TabIcon({ emoji, focused, label }: TabIconProps) {
  return (
    <>
      <Text style={[styles.emoji, focused && styles.emojiFocused]}>{emoji}</Text>
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
    </>
  );
}

export default function TabLayout() {
  const { isReady, hasFamily } = useFamily();
  const { isReady: onboardingReady, isCompleted } = useSetupOnboarding();
  useRefreshRelativesOnFocus();

  if (!isReady || !onboardingReady) {
    return (
      <View style={styles.loadingWrap}>
        <LoadingState message="Жүктелуде..." />
      </View>
    );
  }

  if (!hasFamily) {
    return <Redirect href="/onboarding" />;
  }

  if (!isCompleted) {
    return <Redirect href="/setup-onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Palette.gold,
        tabBarInactiveTintColor: '#A8C5B0',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Басты',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} label="Басты" />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="relatives"
        options={{
          title: 'Туыстар',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👨‍👩‍👧‍👦" focused={focused} label="Туыстар" />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Күнтізбе',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} label="Күнтізбе" />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="shezhire"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="memory"
        options={{
          title: 'Еске алу',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🕊️" focused={focused} label="Еске алу" />,
          tabBarLabel: () => null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    backgroundColor: Palette.cream,
    justifyContent: 'center',
    padding: 24,
  },
  tabBar: {
    backgroundColor: Palette.greenDeep,
    borderTopWidth: 0,
    height: 84,
    paddingTop: 8,
    paddingBottom: 12,
  },
  tabBarLabel: {
    ...Typography.tab,
  },
  emoji: {
    fontSize: 22,
    opacity: 0.65,
    marginBottom: 2,
  },
  emojiFocused: {
    opacity: 1,
  },
  label: {
    ...Typography.tab,
    color: '#A8C5B0',
    fontSize: 11,
  },
  labelFocused: {
    color: Palette.gold,
    fontWeight: '700',
  },
});
