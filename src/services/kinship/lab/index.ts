export type {
  KinshipLabCategory,
  KinshipLabFamily,
  KinshipLabFailure,
  KinshipLabMatrixRow,
  KinshipLabReport,
  KinshipLabRootSwitchRow,
} from '@/services/kinship/lab/kinship-lab.types';
export { KINSHIP_LAB_CATEGORIES } from '@/services/kinship/lab/kinship-lab.types';

export {
  buildBauyrzhanLabFamily,
  getKinshipLabFamily,
  KINSHIP_LAB_FAMILIES,
  labRelative,
} from '@/services/kinship/lab/kinship-lab.fixtures';

export {
  getKinshipLabMatrixByCategory,
  KINSHIP_LAB_MATRIX,
  KINSHIP_LAB_ROOT_SWITCH_MATRIX,
} from '@/services/kinship/lab/kinship-lab.matrix';

export {
  assertKinshipLabReport,
  runKinshipLab,
  runKinshipLabMatrix,
  runKinshipLabMatrixByCategory,
  runKinshipLabRootSwitching,
} from '@/services/kinship/lab/kinship-lab.runner';
