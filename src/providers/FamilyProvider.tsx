import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { familyService } from '@/services/family.service';
import { CreateFamilyInput, FamilySession, JoinFamilyInput } from '@/types/family';

type FamilyContextValue = {
  session: FamilySession | null;
  familyId: string | null;
  isReady: boolean;
  hasFamily: boolean;
  createFamily: (input: CreateFamilyInput) => Promise<FamilySession>;
  joinFamily: (input: JoinFamilyInput) => Promise<FamilySession | null>;
  leaveFamily: () => Promise<void>;
};

const FamilyContext = createContext<FamilyContextValue | null>(null);

export function FamilyProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<FamilySession | null>(null);
  const [isReady, setIsReady] = useState(false);

  const loadSession = useCallback(async () => {
    const stored = await familyService.getSession();
    setSession(stored);
    setIsReady(true);
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const createFamily = useCallback(async (input: CreateFamilyInput) => {
    const created = await familyService.createFamily(input);
    setSession(created);
    return created;
  }, []);

  const joinFamily = useCallback(async (input: JoinFamilyInput) => {
    const joined = await familyService.joinFamily(input);
    if (joined) {
      setSession(joined);
    }
    return joined;
  }, []);

  const leaveFamily = useCallback(async () => {
    await familyService.clearSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      familyId: session?.familyId ?? null,
      isReady,
      hasFamily: Boolean(session?.familyId),
      createFamily,
      joinFamily,
      leaveFamily,
    }),
    [session, isReady, createFamily, joinFamily, leaveFamily],
  );

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamilyContext() {
  const context = useContext(FamilyContext);

  if (!context) {
    throw new Error('useFamilyContext must be used within FamilyProvider');
  }

  return context;
}
