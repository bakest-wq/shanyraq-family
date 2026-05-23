import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { onboardingService } from '@/services/onboarding.service';

type SetupOnboardingContextValue = {
  isReady: boolean;
  isCompleted: boolean;
  complete: () => Promise<void>;
  refresh: () => Promise<void>;
};

const SetupOnboardingContext = createContext<SetupOnboardingContextValue | null>(null);

export function SetupOnboardingProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const refresh = useCallback(async () => {
    const completed = await onboardingService.isSetupCompleted();
    setIsCompleted(completed);
    setIsReady(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const complete = useCallback(async () => {
    await onboardingService.markSetupCompleted();
    setIsCompleted(true);
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      isCompleted,
      complete,
      refresh,
    }),
    [isReady, isCompleted, complete, refresh],
  );

  return (
    <SetupOnboardingContext.Provider value={value}>{children}</SetupOnboardingContext.Provider>
  );
}

export function useSetupOnboardingContext() {
  const context = useContext(SetupOnboardingContext);

  if (!context) {
    throw new Error('useSetupOnboardingContext must be used within SetupOnboardingProvider');
  }

  return context;
}
