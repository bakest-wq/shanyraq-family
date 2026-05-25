import { useRouter, type Href } from 'expo-router';
import { useCallback } from 'react';

import { safeGoBack } from '@/utils/safe-navigation';

export function useSafeGoBack(fallback?: Href) {
  const router = useRouter();

  return useCallback(() => {
    safeGoBack(router, { fallback });
  }, [fallback, router]);
}
