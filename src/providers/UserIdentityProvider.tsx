import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useFamilyContext } from '@/providers/FamilyProvider';
import { useRelativesContext } from '@/providers/RelativesProvider';
import { userIdentityService } from '@/services/user-identity.service';
import type { UserIdentityProfile } from '@/types/user-identity';
import type { Relative } from '@/types/relative';
import { resolveMyRelative } from '@/utils/current-user-relative';

type UserIdentityContextValue = {
  profile: UserIdentityProfile | null;
  myRelativeId: string | null;
  myRelative: Relative | null;
  hasLinkedRelative: boolean;
  isReady: boolean;
  userName: string | null;
  linkRelative: (relativeId: string, userName?: string) => Promise<void>;
  clearLinkedRelative: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const UserIdentityContext = createContext<UserIdentityContextValue | null>(null);

export function UserIdentityProvider({ children }: PropsWithChildren) {
  const { familyId, session } = useFamilyContext();
  const { relatives, loading: relativesLoading } = useRelativesContext();
  const [profile, setProfile] = useState<UserIdentityProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!familyId) {
      setProfile(null);
      setIsReady(true);
      return;
    }

    const stored = await userIdentityService.getProfile(familyId);
    setProfile(stored);
    setIsReady(true);
  }, [familyId]);

  useEffect(() => {
    setIsReady(false);
    void refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (!profile || !familyId || relativesLoading) {
      return;
    }

    const linked = relatives.find((relative) => relative.id === profile.relativeId);
    if (!linked || linked.isDeceased) {
      void userIdentityService.clearProfile(familyId).then(() => {
        setProfile(null);
      });
    }
  }, [familyId, profile, relatives, relativesLoading]);

  const linkRelative = useCallback(
    async (relativeId: string, userName?: string) => {
      if (!familyId) {
        throw new Error('Family is not selected.');
      }

      const nextProfile = await userIdentityService.saveProfile({
        familyId,
        relativeId,
        userName: userName ?? session?.ownerName ?? 'Мен',
      });

      setProfile(nextProfile);
    },
    [familyId, session?.ownerName],
  );

  const clearLinkedRelative = useCallback(async () => {
    if (!familyId) {
      setProfile(null);
      return;
    }

    await userIdentityService.clearProfile(familyId);
    setProfile(null);
  }, [familyId]);

  const myRelative = useMemo(
    () => resolveMyRelative(relatives, profile?.relativeId ?? null),
    [profile?.relativeId, relatives],
  );

  const value = useMemo(
    () => ({
      profile,
      myRelativeId: profile?.relativeId ?? null,
      myRelative,
      hasLinkedRelative: Boolean(profile?.relativeId && myRelative),
      isReady,
      userName: profile?.userName ?? session?.ownerName ?? null,
      linkRelative,
      clearLinkedRelative,
      refreshProfile,
    }),
    [
      clearLinkedRelative,
      isReady,
      linkRelative,
      myRelative,
      profile,
      refreshProfile,
      session?.ownerName,
    ],
  );

  return <UserIdentityContext.Provider value={value}>{children}</UserIdentityContext.Provider>;
}

export function useUserIdentityContext() {
  const context = useContext(UserIdentityContext);

  if (!context) {
    throw new Error('useUserIdentityContext must be used within UserIdentityProvider');
  }

  return context;
}
