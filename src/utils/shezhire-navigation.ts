import { useRouter } from 'expo-router';

type AppRouter = ReturnType<typeof useRouter>;

export function focusPersonInShezhire(router: AppRouter, relativeId: string): void {
  router.push({
    pathname: '/(tabs)/shezhire',
    params: { focusRootId: relativeId },
  });
}
