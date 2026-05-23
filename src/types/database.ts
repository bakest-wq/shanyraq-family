export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type FamilyRow = {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
  updated_at: string;
};

export type FamilyInsert = {
  id?: string;
  name: string;
  invite_code: string;
};

export type FamilyUpdate = Partial<FamilyInsert>;

export type FamilyMemberRow = {
  id: string;
  family_id: string;
  display_name: string;
  role: 'owner' | 'member';
  created_at: string;
};

export type FamilyMemberInsert = {
  id?: string;
  family_id: string;
  display_name: string;
  role?: 'owner' | 'member';
};

export type FamilyMemberUpdate = Partial<FamilyMemberInsert>;

export type RelativeRow = {
  id: string;
  family_id: string | null;
  full_name: string;
  first_name: string | null;
  middle_name: string | null;
  birth_surname: string | null;
  current_surname: string | null;
  display_name: string | null;
  relationship: string;
  birthday: string | null;
  birthday_day: number | null;
  birthday_month: number | null;
  birthday_year: number | null;
  phone: string | null;
  avatar_color: string;
  is_deceased: boolean;
  death_year: number | null;
  dua_text: string | null;
  notes: string | null;
  father_id: string | null;
  mother_id: string | null;
  spouse_id: string | null;
  gender: 'male' | 'female' | null;
  marital_status: 'single' | 'married' | 'widowed' | 'divorced' | null;
  zhuz: string | null;
  ru: string | null;
  ata_line: string | null;
  tribe_branch: string | null;
  created_at: string;
  updated_at: string;
};

export type RelativeInsert = {
  id?: string;
  family_id?: string | null;
  full_name: string;
  first_name?: string | null;
  middle_name?: string | null;
  birth_surname?: string | null;
  current_surname?: string | null;
  display_name?: string | null;
  relationship: string;
  birthday?: string | null;
  birthday_day?: number | null;
  birthday_month?: number | null;
  birthday_year?: number | null;
  phone?: string | null;
  avatar_color?: string;
  is_deceased?: boolean;
  death_year?: number | null;
  dua_text?: string | null;
  notes?: string | null;
  father_id?: string | null;
  mother_id?: string | null;
  spouse_id?: string | null;
  gender?: 'male' | 'female' | null;
  marital_status?: 'single' | 'married' | 'widowed' | 'divorced' | null;
  zhuz?: string | null;
  ru?: string | null;
  ata_line?: string | null;
  tribe_branch?: string | null;
};

export type RelativeUpdate = Partial<RelativeInsert>;

export type Database = {
  public: {
    Tables: {
      families: {
        Row: FamilyRow;
        Insert: FamilyInsert;
        Update: FamilyUpdate;
        Relationships: [];
      };
      family_members: {
        Row: FamilyMemberRow;
        Insert: FamilyMemberInsert;
        Update: FamilyMemberUpdate;
        Relationships: [];
      };
      relatives: {
        Row: RelativeRow;
        Insert: RelativeInsert;
        Update: RelativeUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
