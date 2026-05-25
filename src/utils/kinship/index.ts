export type {
  KinshipCategory,
  KinshipExplanation,
  KinshipLabel,
  KinshipPathStep,
  KinshipResult,
  KinshipType,
} from '@/utils/kinship/types';

export {
  areSpouses,
  compareBirthYear,
  getChildren,
  getEffectiveSpouse,
  getGrandchildren,
  getGrandparents,
  getParents,
  getPersonById,
  getSiblings,
  isFemale,
  isMale,
} from '@/utils/kinship/graph';

export {
  formatKinshipBadge,
  formatKinshipCardLine,
  GENDER_HINT_KZ,
  getKinshipLabelText,
  KINSHIP_LABELS,
} from '@/utils/kinship/labels.kz';

export {
  getKinshipBadge,
  getKinshipCardLine,
  getKinshipDetailExplanation,
  getKinshipLabel,
  getKinshipShortExplanation,
} from '@/utils/kinship/getKinshipLabel';

export {
  getKinshipCardLabel,
  getKinshipExplanation,
  getKinshipExplanationBetween,
  getKinshipPath,
  getKinshipPathDescription,
  getRelationshipConfidence,
  getThreeJurtGroup,
  kinshipService,
  mapThreeJurtGroupToJurtKind,
  type KinshipConfidence,
  type ThreeJurtGroup,
} from '@/services/kinship.service';

export {
  formatKinshipMainLabel,
  formatKinshipDetailSummary,
} from '@/utils/kinship/kinship-display';
