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
import {
  CreateFamilyInput,
  FamilySession,
  FinalizeJoinInput,
  JoinFamilyInput,
  JoinFamilyPreview,
} from '@/types/family';
import { isFamilyOwner } from '@/utils/family-permissions';

type FamilyContextValue = {
  session: FamilySession | null;
  familyId: string | null;
  isReady: boolean;
  hasFamily: boolean;
  isOwner: boolean;
  createFamily: (input: CreateFamilyInput) => Promise<FamilySession>;
  resolveInviteCode: (input: JoinFamilyInput) => Promise<JoinFamilyPreview | null>;
  finalizeJoin: (input: FinalizeJoinInput) => Promise<FamilySession>;
  updateMemberIdentity: (input: {
    displayName?: string;
    relativeId?: string | null;
  }) => Promise<FamilySession | null>;
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

  const resolveInviteCode = useCallback(async (input: JoinFamilyInput) => {
    return familyService.resolveInviteCode(input);
  }, []);

  const finalizeJoin = useCallback(async (input: FinalizeJoinInput) => {
    const joined = await familyService.finalizeJoin(input);
    setSession(joined);
    return joined;
  }, []);

  const updateMemberIdentity = useCallback(
    async (input: { displayName?: string; relativeId?: string | null }) => {
      if (!session) {
        return null;
      }

      const next = await familyService.updateMemberIdentity(session, input);
      setSession(next);
      return next;
    },
    [session],
  );

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
      isOwner: isFamilyOwner(session?.role),
      createFamily,
      resolveInviteCode,
      finalizeJoin,
      updateMemberIdentity,
      leaveFamily,
    }),
    [
      session,
      isReady,
      createFamily,
      resolveInviteCode,
      finalizeJoin,
      updateMemberIdentity,
      leaveFamily,
    ],
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
