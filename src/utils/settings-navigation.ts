import { useRouter } from 'expo-router';

type AppRouter = ReturnType<typeof useRouter>;

export function openAppSettings(router: AppRouter): void {
  router.push('/(tabs)/management');
}
