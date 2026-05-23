import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Palette } from '@/constants/theme';
import { ArchiveProvider } from '@/providers/ArchiveProvider';
import { FamilyProvider } from '@/providers/FamilyProvider';
import { NotificationsProvider } from '@/providers/NotificationsProvider';
import { RelativesProvider } from '@/providers/RelativesProvider';
import { SetupOnboardingProvider } from '@/providers/SetupOnboardingProvider';
import { TimelineProvider } from '@/providers/TimelineProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { UserIdentityProvider } from '@/providers/UserIdentityProvider';

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <RelativesProvider>
        <UserIdentityProvider>
          <ArchiveProvider>
            <TimelineProvider>
              <NotificationsProvider>{children}</NotificationsProvider>
            </TimelineProvider>
          </ArchiveProvider>
        </UserIdentityProvider>
      </RelativesProvider>
    </ToastProvider>
  );
}

export default function RootLayout() {
  return (
    <FamilyProvider>
      <SetupOnboardingProvider>
        <AppProviders>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Palette.cream } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="setup-onboarding" options={{ animation: 'fade' }} />
            <Stack.Screen name="create-family" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="join-family" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="who-am-i" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="notification-settings" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="archive" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="family-memories" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="timeline" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="add-memory" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="add-timeline-event" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="add-relative" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="relative/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="edit-relative/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="congratulations/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="connect-relative/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="relationship" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="shezhire-health-check" options={{ animation: 'slide_from_right' }} />
          </Stack>
        </AppProviders>
      </SetupOnboardingProvider>
    </FamilyProvider>
  );
}
