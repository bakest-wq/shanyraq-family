import { Redirect, Tabs } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FloatingSettingsButton } from '@/components/ui/FloatingSettingsButton';
import { LoadingState } from '@/components/ui/LoadingState';
import { APP_TABS } from '@/constants/app-navigation-content';
import { useAppTheme, useElderMode } from '@/hooks/useElderMode';
import { useFamily } from '@/hooks/useFamily';
import { useSetupOnboarding } from '@/hooks/useSetupOnboarding';
import { useRefreshRelativesOnFocus } from '@/hooks/useRelatives';

type TabIconProps = {
  emoji: string;
  focused: boolean;
  label: string;
};

function TabIcon({ emoji, focused, label }: TabIconProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createIconStyles(theme), [theme]);

  return (
    <>
      <Text style={[styles.emoji, focused && styles.emojiFocused]}>{emoji}</Text>
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
    </>
  );
}

function createIconStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    emoji: {
      fontSize: theme.layout.tabEmojiSize,
      opacity: 0.72,
      marginBottom: 2,
    },
    emojiFocused: {
      opacity: 1,
    },
    label: {
      ...theme.typography.tab,
      color: '#A8C5B0',
      fontSize: theme.layout.tabLabelSize,
      fontWeight: '700',
    },
    labelFocused: {
      color: theme.palette.gold,
    },
  });
}

export default function TabLayout() {
  const { isReady, hasFamily } = useFamily();
  const { isReady: onboardingReady, isCompleted } = useSetupOnboarding();
  const { enabled: elderMode } = useElderMode();
  const theme = useAppTheme();
  useRefreshRelativesOnFocus();

  const styles = useMemo(() => createLayoutStyles(theme), [theme]);

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
    <View style={styles.root}>
      <Tabs
        initialRouteName={elderMode ? 'shezhire' : 'index'}
        screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.palette.gold,
        tabBarInactiveTintColor: '#A8C5B0',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: APP_TABS.home.label,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={APP_TABS.home.emoji} focused={focused} label={APP_TABS.home.label} />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="shezhire"
        options={{
          title: APP_TABS.shezhire.label,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji={APP_TABS.shezhire.emoji}
              focused={focused}
              label={APP_TABS.shezhire.label}
            />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="relatives"
        options={{
          title: APP_TABS.relatives.label,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji={APP_TABS.relatives.emoji}
              focused={focused}
              label={APP_TABS.relatives.label}
            />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="memory"
        options={{
          href: elderMode ? null : undefined,
          title: APP_TABS.memories.label,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji={APP_TABS.memories.emoji}
              focused={focused}
              label={APP_TABS.memories.label}
            />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="management"
        options={{
          href: elderMode ? null : undefined,
          title: APP_TABS.management.label,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji={APP_TABS.management.emoji}
              focused={focused}
              label={APP_TABS.management.label}
            />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          href: null,
        }}
      />
    </Tabs>
      <FloatingSettingsButton />
    </View>
  );
}

function createLayoutStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    root: {
      flex: 1,
    },
    loadingWrap: {
      flex: 1,
      backgroundColor: theme.palette.cream,
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    tabBar: {
      backgroundColor: theme.palette.greenDeep,
      borderTopWidth: 0,
      height: theme.layout.tabBarHeight,
      paddingTop: 8,
      paddingBottom: 12,
    },
    tabBarLabel: {
      ...theme.typography.tab,
    },
  });
}
