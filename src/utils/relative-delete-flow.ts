import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { getRelativeReferences } from '@/utils/get-relative-references';

export const DELETE_RELATIVE_COPY = {
  confirmTitle: 'Бұл туысты жою керек пе?',
  confirmHint: 'Бұл әрекетті мұқият орындаңыз.',
  cancel: 'Бас тарту',
  confirm: 'Жою',
  blockedTitle: 'Бұл адам басқа байланыстарда қолданылып тұр',
  blockedHint: 'Алдымен байланыстарды тазартып, содан кейін жоюға болады.',
  clearReferences: 'Байланыстарды тазарту',
  clearReferencesDone: 'Байланыстар тазартылды. Енді жоюға болады.',
  abortDelete: 'Жоюдан бас тарту',
  successTitle: 'Туыс жойылды 🌿',
  successOk: 'Жарайды',
  deleting: 'Жойылуда...',
  deleteLabel: 'Туысын жою',
  rootDeleteTitle: 'Шежіре орталығын жою',
  rootDeleteMessage: 'Бұл адам сіздің ағашыңыздың орталығы. Жоюды растайсыз ба?',
  linkedSelfDeleteTitle: 'Өз профиліңізді жою',
  linkedSelfDeleteMessage: 'Байланған тұлғаңызды жойғыңыз келе ме?',
} as const;

export type RelativeDeleteModalStep =
  | 'closed'
  | 'root_confirm'
  | 'blocked'
  | 'confirm'
  | 'clear_done'
  | 'success';

export type ProtectedRootCheckOptions = {
  treeRootId?: string | null;
  myRelativeId?: string | null;
};

export function isProtectedRootPerson(
  relativeId: string,
  options: ProtectedRootCheckOptions,
): boolean {
  if (options.myRelativeId && relativeLinkIdsMatch(relativeId, options.myRelativeId)) {
    return true;
  }

  if (options.treeRootId && relativeLinkIdsMatch(relativeId, options.treeRootId)) {
    return true;
  }

  return false;
}

/** @deprecated Use getRelativeReferences directly */
export function assessDeleteFromReferences(relativeId: string, relatives: Relative[]) {
  return getRelativeReferences(relativeId, relatives);
}
