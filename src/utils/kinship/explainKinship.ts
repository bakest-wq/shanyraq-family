/**
 * Legacy explain module — delegates to the intelligence engine.
 * Path text is intentionally hidden from UX (pathText stays empty).
 */
export {
  explainKinship,
  explainKinshipToMe,
  getKinshipExplanation,
  getKinshipExplanationBetween,
} from '@/services/kinship/kinship-explanations';
