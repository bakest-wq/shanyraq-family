import AsyncStorage from '@react-native-async-storage/async-storage';

import { isSupabaseReady } from '@/lib/supabase';
import { familiesService } from '@/services/families.service';
import {
  CreateFamilyInput,
  FamilySession,
  FinalizeJoinInput,
  JoinFamilyInput,
  JoinFamilyPreview,
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

async function saveJoinedFamilyLocally(session: FamilySession): Promise<void> {
  const families = await readLocalFamilies();
  const existing = families.find((family) => family.id === session.familyId);

  if (!existing) {
    const storedFamily: StoredFamily = {
      id: session.familyId,
      name: session.familyName,
      inviteCode: session.inviteCode,
      ownerName: session.role === 'owner' ? session.ownerName : '—',
      createdAt: new Date().toISOString(),
    };
    await writeLocalFamilies([storedFamily, ...families]);
  }

  await persistSession(session);
}

const SUPABASE_CREATE_TIMEOUT_MS = 8000;

function buildSession(
  familyId: string,
  familyName: string,
  displayName: string,
  inviteCode: string,
  role: FamilySession['role'],
  options?: { memberId?: string; relativeId?: string | null },
): FamilySession {
  return {
    familyId,
    familyName,
    ownerName: displayName,
    inviteCode,
    role,
    memberId: options?.memberId,
    relativeId: options?.relativeId ?? null,
  };
}

async function createFamilyOnSupabase(
  familyName: string,
  ownerName: string,
  inviteCode: string,
): Promise<FamilySession | null> {
  const createTask = (async () => {
    const familyId = createUuid();
    const remote = await familiesService.create(familyName, inviteCode, ownerName, familyId);
    const member = await familiesService.addMember({
      family_id: remote.id,
      display_name: ownerName,
      role: 'owner',
    });

    return buildSession(remote.id, remote.name, ownerName, remote.inviteCode, 'owner', {
      memberId: member.id,
      relativeId: member.relativeId,
    });
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

async function syncMemberToSupabase(
  session: FamilySession,
  displayName: string,
  relativeId?: string | null,
): Promise<FamilySession> {
  if (!isSupabaseReady()) {
    return session;
  }

  try {
    if (session.memberId) {
      const updated = await familiesService.updateMember({
        memberId: session.memberId,
        familyId: session.familyId,
        displayName,
        relativeId: relativeId ?? session.relativeId ?? null,
      });

      return {
        ...session,
        ownerName: updated.displayName,
        relativeId: updated.relativeId,
      };
    }

    const member = await familiesService.addMember({
      family_id: session.familyId,
      display_name: displayName,
      role: session.role,
      relative_id: relativeId ?? null,
    });

    return {
      ...session,
      memberId: member.id,
      ownerName: member.displayName,
      relativeId: member.relativeId,
    };
  } catch {
    return session;
  }
}

function mapStoredFamilyToPreview(family: StoredFamily): JoinFamilyPreview {
  return {
    familyId: family.id,
    familyName: family.name,
    inviteCode: family.inviteCode,
    ownerName: family.ownerName,
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

    const session = buildSession(createUuid(), familyName, ownerName, inviteCode, 'owner');
    await saveLocalFamilyAndSession(session);
    return session;
  },

  /** Resolve invite code to a family preview before identity selection. */
  async resolveInviteCode(input: JoinFamilyInput): Promise<JoinFamilyPreview | null> {
    const code = normalizeInviteCode(input.inviteCode);

    if (!code) {
      return null;
    }

    const families = await readLocalFamilies();
    const localMatch = families.find((family) => normalizeInviteCode(family.inviteCode) === code);

    if (localMatch) {
      return mapStoredFamilyToPreview(localMatch);
    }

    if (isSupabaseReady()) {
      try {
        const remoteFamily = await familiesService.getByInviteCode(code);

        if (remoteFamily) {
          return {
            familyId: remoteFamily.id,
            familyName: remoteFamily.name,
            inviteCode: remoteFamily.inviteCode,
            ownerName: remoteFamily.ownerName,
          };
        }
      } catch {
        return null;
      }
    }

    return null;
  },

  /** Complete join after the user picks or creates their shezhire profile. */
  async finalizeJoin(input: FinalizeJoinInput): Promise<FamilySession> {
    const displayName = input.displayName.trim();

    let session = buildSession(
      input.familyId,
      input.familyName,
      displayName,
      input.inviteCode,
      'member',
      { relativeId: input.relativeId ?? null },
    );

    session = await syncMemberToSupabase(session, displayName, input.relativeId ?? null);
    await saveJoinedFamilyLocally(session);
    return session;
  },

  /** @deprecated Use resolveInviteCode + finalizeJoin for the join flow. */
  async joinFamily(input: JoinFamilyInput & { memberName: string }): Promise<FamilySession | null> {
    const preview = await this.resolveInviteCode(input);

    if (!preview) {
      return null;
    }

    return this.finalizeJoin({
      familyId: preview.familyId,
      familyName: preview.familyName,
      inviteCode: preview.inviteCode,
      displayName: input.memberName.trim(),
    });
  },

  async updateMemberIdentity(
    session: FamilySession,
    input: { displayName?: string; relativeId?: string | null },
  ): Promise<FamilySession> {
    const nextSession = await syncMemberToSupabase(
      session,
      input.displayName ?? session.ownerName,
      input.relativeId,
    );

    await persistSession(nextSession);
    return nextSession;
  },

  async clearSession(): Promise<void> {
    await AsyncStorage.multiRemove([SESSION_KEY, FAMILY_ID_KEY]);
  },
};
