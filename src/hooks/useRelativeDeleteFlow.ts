import { useCallback, useState } from 'react';

import type { Relative } from '@/types/relative';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import {
  getRelativeReferences,
  type RelativeReferenceLink,
} from '@/utils/get-relative-references';
import {
  isProtectedRootPerson,
  type RelativeDeleteModalStep,
} from '@/utils/relative-delete-flow';

type UseRelativeDeleteFlowOptions = {
  relative: Relative | null;
  relatives: Relative[];
  deleteRelative: (relativeId: string) => Promise<boolean>;
  clearRelativeReferences: (relativeId: string) => Promise<number>;
  onDeleted: () => void;
  treeRootId?: string | null;
  myRelativeId?: string | null;
};

function resolveDeleteStep(
  relativeId: string,
  relatives: Relative[],
  options: Pick<UseRelativeDeleteFlowOptions, 'treeRootId' | 'myRelativeId'>,
): RelativeDeleteModalStep {
  if (
    isProtectedRootPerson(relativeId, {
      treeRootId: options.treeRootId,
      myRelativeId: options.myRelativeId,
    })
  ) {
    return 'root_confirm';
  }

  const refs = getRelativeReferences(relativeId, relatives);
  return refs.hasReferences ? 'blocked' : 'confirm';
}

export function useRelativeDeleteFlow({
  relative,
  relatives,
  deleteRelative,
  clearRelativeReferences,
  onDeleted,
  treeRootId,
  myRelativeId,
}: UseRelativeDeleteFlowOptions) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [step, setStep] = useState<RelativeDeleteModalStep>('closed');
  const [referenceLinks, setReferenceLinks] = useState<RelativeReferenceLink[]>([]);
  const [clearing, setClearing] = useState(false);

  const isLinkedSelf = Boolean(
    relative &&
      myRelativeId &&
      relativeLinkIdsMatch(relative.id, myRelativeId),
  );

  const closeModal = useCallback(() => {
    setShowDeleteConfirm(false);
    setStep('closed');
    setReferenceLinks([]);
    setClearing(false);
  }, []);

  const refreshReferences = useCallback(
    (relativeId: string) => {
      const refs = getRelativeReferences(relativeId, relatives);
      setReferenceLinks(refs.links);
      return refs;
    },
    [relatives],
  );

  const startDelete = useCallback(() => {
    if (!relative) {
      return;
    }

    console.log('DELETE RELATIVE CLICKED', relative.id);

    refreshReferences(relative.id);
    setStep(
      resolveDeleteStep(relative.id, relatives, {
        treeRootId,
        myRelativeId,
      }),
    );
    setShowDeleteConfirm(true);
  }, [myRelativeId, refreshReferences, relative, relatives, treeRootId]);

  const handleRootContinue = useCallback(() => {
    if (!relative) {
      return;
    }

    const refs = refreshReferences(relative.id);
    setStep(refs.hasReferences ? 'blocked' : 'confirm');
  }, [refreshReferences, relative]);

  const handleClearReferences = useCallback(async () => {
    if (!relative) {
      return;
    }

    setClearing(true);

    try {
      await clearRelativeReferences(relative.id);
      setReferenceLinks([]);
      setStep('clear_done');
    } finally {
      setClearing(false);
    }
  }, [clearRelativeReferences, relative]);

  const handleConfirmDelete = useCallback(async () => {
    if (!relative) {
      return;
    }

    const success = await deleteRelative(relative.id);
    if (success) {
      setStep('success');
    }
  }, [deleteRelative, relative]);

  const handleSuccessClose = useCallback(() => {
    closeModal();
    onDeleted();
  }, [closeModal, onDeleted]);

  return {
    showDeleteConfirm,
    startDelete,
    deleteModalProps: {
      visible: showDeleteConfirm,
      step,
      referenceLinks,
      clearing,
      isLinkedSelf,
      onCancel: closeModal,
      onRootContinue: handleRootContinue,
      onClearReferences: handleClearReferences,
      onConfirmDelete: handleConfirmDelete,
      onSuccessClose: handleSuccessClose,
    },
  };
}
