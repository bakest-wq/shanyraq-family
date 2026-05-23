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
  buildKinshipEdges,
  describeKinshipPath,
  findKinshipPath,
  summarizeStructuralBridge,
} from '@/utils/kinship/path';

export {
  getKinshipBadge,
  getKinshipCardLine,
  getKinshipLabel,
  getKinshipShortExplanation,
} from '@/utils/kinship/getKinshipLabel';

export { classifyKinship } from '@/utils/kinship/classify';

export { explainKinship, explainKinshipToMe } from '@/utils/kinship/explainKinship';
