import { Alert } from 'react-native';

import { DUPLICATE_RELATIVE_COPY } from '@/constants/duplicate-relative-content';
import { EDIT_HISTORY_COPY } from '@/constants/edit-history-content';
import { GRAPH_VERSION_COPY } from '@/constants/graph-version-content';

export function confirmSaveChanges(onConfirm: () => void): void {
  Alert.alert(EDIT_HISTORY_COPY.saveConfirmTitle, EDIT_HISTORY_COPY.saveConfirmHint, [
    { text: EDIT_HISTORY_COPY.cancel, style: 'cancel' },
    { text: EDIT_HISTORY_COPY.save, onPress: onConfirm },
  ]);
}

export function confirmRestore(onConfirm: () => void): void {
  Alert.alert(EDIT_HISTORY_COPY.restoreConfirmTitle, EDIT_HISTORY_COPY.restoreConfirmHint, [
    { text: EDIT_HISTORY_COPY.cancel, style: 'cancel' },
    {
      text: EDIT_HISTORY_COPY.restore,
      style: 'destructive',
      onPress: onConfirm,
    },
  ]);
}

export function confirmDuplicateRelativeProceed(
  onViewExisting: () => void,
  onProceed: () => void,
): void {
  Alert.alert(DUPLICATE_RELATIVE_COPY.confirmTitle, DUPLICATE_RELATIVE_COPY.confirmHint, [
    { text: DUPLICATE_RELATIVE_COPY.cancel, style: 'cancel' },
    {
      text: DUPLICATE_RELATIVE_COPY.viewExisting,
      onPress: onViewExisting,
    },
    {
      text: DUPLICATE_RELATIVE_COPY.addAnyway,
      style: 'destructive',
      onPress: onProceed,
    },
  ]);
}

export function confirmGraphRestore(onConfirm: () => void): void {
  Alert.alert(GRAPH_VERSION_COPY.restoreConfirmTitle, GRAPH_VERSION_COPY.restoreConfirmHint, [
    { text: EDIT_HISTORY_COPY.cancel, style: 'cancel' },
    {
      text: GRAPH_VERSION_COPY.restore,
      style: 'destructive',
      onPress: onConfirm,
    },
  ]);
}

export function confirmDeleteMemory(onConfirm: () => void): void {
  Alert.alert(
    'Естелікті жоямыз ба?',
    'Жойылған естелік тарихта сақталады — кейін қалпына келтіруге болады.',
    [
      { text: EDIT_HISTORY_COPY.cancel, style: 'cancel' },
      { text: 'Жою', style: 'destructive', onPress: onConfirm },
    ],
  );
}
