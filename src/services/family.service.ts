import AsyncStorage from '@react-native-async-storage/async-storage';

import { isSupabaseReady } from '@/lib/supabase';
import { familiesService } from '@/services/families.service';
import {
  CreateFamilyInput,
  FamilySession,
  JoinFamilyInput,
} from '@/types/family';
import { generateInviteCode, normalizeInviteCode } from '@/utils/family-invite';

const SESSION_KEY = '@shanyraq/family-session';
const FAMILY_ID_KEY = '@shanyraq/current-family-id';
const LOCAL_FAMILIES_KEY = '@shanyraq/local-families';

type StoredFamily = {
  id: string;
  name: string;
  inviteCode: string;
  ownerName: string;
  createdAt: string;
};

function createUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

async function readLocalFamilies(): Promise<StoredFamily[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_FAMILIES_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as StoredFamily[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocalFamilies(families: StoredFamily[]): Promise<void> {
  await AsyncStorage.setItem(LOCAL_FAMILIES_KEY, JSON.stringify(families));
}

async function persistSession(session: FamilySession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  await AsyncStorage.setItem(FAMILY_ID_KEY, session.familyId);
}

async function saveLocalFamilyAndSession(session: FamilySession): Promise<void> {
  const storedFamily: StoredFamily = {
    id: session.familyId,
    name: session.familyName,
    inviteCode: session.inviteCode,
    ownerName: session.ownerName,
    createdAt: new Date().toISOString(),
  };

  const families = await readLocalFamilies();
  const withoutDuplicate = families.filter((family) => family.id !== session.familyId);
  await writeLocalFamilies([storedFamily, ...withoutDuplicate]);
  await persistSession(session);
}

async function syncMemberToSupabase(session: FamilySession): Promise<void> {
  if (!isSupabaseReady()) {
    return;
  }

  try {
    await familiesService.addMember({
      family_id: session.familyId,
      display_name: session.ownerName,
      role: session.role,
    });
  } catch {
    // Local session is already saved.
  }
}

const SUPABASE_CREATE_TIMEOUT_MS = 8000;

async function createFamilyOnSupabase(
  familyName: string,
  ownerName: string,
  inviteCode: string,
): Promise<FamilySession | null> {
  const createTask = (async () => {
    const familyId = createUuid();
    const remote = await familiesService.create(familyName, inviteCode, familyId);
    await familiesService.addMember({
      family_id: remote.id,
      display_name: ownerName,
      role: 'owner',
    });

    return buildSession(remote.id, remote.name, ownerName, remote.inviteCode);
  })();

  const timeoutTask = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Supabase request timed out')), SUPABASE_CREATE_TIMEOUT_MS);
  });

  try {
    return await Promise.race([createTask, timeoutTask]);
  } catch {
    return null;
  }
}

function buildSession(
  familyId: string,
  familyName: string,
  ownerName: string,
  inviteCode: string,
): FamilySession {
  return {
    familyId,
    familyName,
    ownerName,
    inviteCode,
    role: 'owner',
  };
}

export const familyService = {
  async getSession(): Promise<FamilySession | null> {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as FamilySession;
    } catch {
      return null;
    }
  },

  async getCurrentFamilyId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(FAMILY_ID_KEY);
    } catch {
      return null;
    }
  },

  async createFamily(input: CreateFamilyInput): Promise<FamilySession> {
    const familyName = input.familyName.trim();
    const ownerName = input.ownerName.trim();
    const inviteCode = generateInviteCode();

    if (isSupabaseReady()) {
      const remoteSession = await createFamilyOnSupabase(familyName, ownerName, inviteCode);

      if (remoteSession) {
        await saveLocalFamilyAndSession(remoteSession);
        return remoteSession;
      }
    }

    const session = buildSession(createUuid(), familyName, ownerName, inviteCode);
    await saveLocalFamilyAndSession(session);
    return session;
  },

  /** Join by invite code — local registry first, then Supabase if configured. */
  async joinFamily(input: JoinFamilyInput): Promise<FamilySession | null> {
    const code = normalizeInviteCode(input.inviteCode);
    const memberName = input.memberName.trim();

    if (!code || !memberName) {
      return null;
    }

    const families = await readLocalFamilies();
    const localMatch = families.find(
      (family) => normalizeInviteCode(family.inviteCode) === code,
    );

    if (localMatch) {
      const session: FamilySession = {
        familyId: localMatch.id,
        familyName: localMatch.name,
        ownerName: memberName,
        inviteCode: localMatch.inviteCode,
        role: 'member',
      };

      await persistSession(session);
      await syncMemberToSupabase(session);
      return session;
    }

    if (isSupabaseReady()) {
      try {
        const remoteFamily = await familiesService.getByInviteCode(code);

        if (remoteFamily) {
          const session: FamilySession = {
            familyId: remoteFamily.id,
            familyName: remoteFamily.name,
            ownerName: memberName,
            inviteCode: remoteFamily.inviteCode,
            role: 'member',
          };

          await persistSession(session);
          await syncMemberToSupabase(session);
          return session;
        }
      } catch {
        // Fall through to not found.
      }
    }

    return null;
  },

  async clearSession(): Promise<void> {
    await AsyncStorage.multiRemove([SESSION_KEY, FAMILY_ID_KEY]);
  },
};
