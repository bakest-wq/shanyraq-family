import {
  isChildRelationship,
  isExtendedRelationship,
  isParentRelationship,
  isSiblingRelationship,
  isSpouseRelationship,
} from '@/utils/relationship-presets';
import { isParentSideSiblingRelationship } from '@/utils/parent-side-sibling-add';

export type FamilyLinkUiMode = 'general' | 'child' | 'parent' | 'spouse' | 'sibling' | 'extended';

export type FamilyLinkFormLayout = {
  mode: FamilyLinkUiMode;
  showFatherPicker: boolean;
  showMotherPicker: boolean;
  showSpousePicker: boolean;
  showChildrenPicker: boolean;
  showSiblingPicker: boolean;
  showExtendedGuide: boolean;
  sectionTitle: string;
  sectionSubtitle: string;
};

export function resolveFamilyLinkUiMode(relationship: string): FamilyLinkUiMode {
  if (isChildRelationship(relationship)) {
    return 'child';
  }

  if (isParentRelationship(relationship)) {
    return 'parent';
  }

  if (isSpouseRelationship(relationship)) {
    return 'spouse';
  }

  if (isSiblingRelationship(relationship)) {
    return 'sibling';
  }

  if (isExtendedRelationship(relationship)) {
    return 'extended';
  }

  return 'general';
}

export function resolveFamilyLinkFormLayout(relationship: string): FamilyLinkFormLayout {
  const mode = resolveFamilyLinkUiMode(relationship);

  switch (mode) {
    case 'child':
      return {
        mode,
        showFatherPicker: true,
        showMotherPicker: true,
        showSpousePicker: false,
        showChildrenPicker: false,
        showSiblingPicker: false,
        showExtendedGuide: false,
        sectionTitle: 'Ата-ана · Родители',
        sectionSubtitle: 'Бала үшін әke мен ana таңдаңыз · Select parents for this child',
      };
    case 'parent':
      return {
        mode,
        showFatherPicker: false,
        showMotherPicker: false,
        showSpousePicker: true,
        showChildrenPicker: true,
        showSiblingPicker: false,
        showExtendedGuide: false,
        sectionTitle: 'Отбасы байланысы · Family links',
        sectionSubtitle: 'Балалар мен жұбай · Children and spouse',
      };
    case 'spouse':
      return {
        mode,
        showFatherPicker: false,
        showMotherPicker: false,
        showSpousePicker: true,
        showChildrenPicker: false,
        showSiblingPicker: false,
        showExtendedGuide: false,
        sectionTitle: 'Жұбайы · Супруг(а)',
        sectionSubtitle: 'Жұбайды таңдаңыз · Select spouse (syncs both ways)',
      };
    case 'sibling':
      if (isParentSideSiblingRelationship(relationship)) {
        return {
          mode,
          showFatherPicker: true,
          showMotherPicker: true,
          showSpousePicker: false,
          showChildrenPicker: false,
          showSiblingPicker: false,
          showExtendedGuide: false,
          sectionTitle: 'Бауыр · Sibling',
          sectionSubtitle:
            'Ата-ана әke/ana арқылы толтырылды · Parents prefilled from your parent',
        };
      }

      return {
        mode,
        showFatherPicker: true,
        showMotherPicker: true,
        showSpousePicker: false,
        showChildrenPicker: false,
        showSiblingPicker: true,
        showExtendedGuide: false,
        sectionTitle: 'Бауыр · Sibling',
        sectionSubtitle:
          'Ата-ана таңдаңыз немесе ортақ ата-анасы бар бауырды қосыңыз · Pick parents or link via sibling',
      };
    case 'extended':
      return {
        mode,
        showFatherPicker: false,
        showMotherPicker: false,
        showSpousePicker: false,
        showChildrenPicker: false,
        showSiblingPicker: false,
        showExtendedGuide: true,
        sectionTitle: 'Туысқан байланысы · Extended kinship',
        sectionSubtitle: 'Алдымен жақын отбасын байланыстырыңыз · Link core family first',
      };
    default:
      return {
        mode,
        showFatherPicker: true,
        showMotherPicker: true,
        showSpousePicker: true,
        showChildrenPicker: false,
        showSiblingPicker: false,
        showExtendedGuide: false,
        sectionTitle: 'Отбасы байланысы · Family links',
        sectionSubtitle: 'Әke, ana, жұбай · Parents and spouse',
      };
  }
}

export const EXTENDED_FAMILY_LINK_HELPER =
  'Бұл байланыс әke/ана/жұбай арқылы анықталады · This relation is defined through parent/spouse links';
