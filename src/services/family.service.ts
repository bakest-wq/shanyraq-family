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

async function syncFamilyToSupabase(session: FamilySession): Promise<void> {
  if (!isSupabaseReady()) {
    return;
  }

  try {
    await familiesService.create(session.familyName, session.inviteCode, session.familyId);
    await familiesService.addMember({
      family_id: session.familyId,
      display_name: session.ownerName,
      role: session.role,
    });
  } catch {
    // Local session still works; Supabase sync can be retried later.
  }
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
    const familyId = createUuid();
    const inviteCode = generateInviteCode();
    const session: FamilySession = {
      familyId,
      familyName: input.familyName.trim(),
      ownerName: input.ownerName.trim(),
      inviteCode,
      role: 'owner',
    };

    const storedFamily: StoredFamily = {
      id: familyId,
      name: session.familyName,
      inviteCode,
      ownerName: session.ownerName,
      createdAt: new Date().toISOString(),
    };

    const families = await readLocalFamilies();
    await writeLocalFamilies([storedFamily, ...families]);
    await persistSession(session);
    await syncFamilyToSupabase(session);
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
