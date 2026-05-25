import { kk, FAMILY_LANGUAGE } from '@/content/family-language';

export const FAMILY_BACKUP_COPY = {
  sectionTitle: kk(FAMILY_LANGUAGE.backup.sectionTitle),
  sectionHint: kk(FAMILY_LANGUAGE.backup.sectionHint),
  screenTitle: kk(FAMILY_LANGUAGE.backup.screenTitle),
  screenSubtitle: kk(FAMILY_LANGUAGE.backup.screenSubtitle),
  reassuranceTitle: kk(FAMILY_LANGUAGE.backup.reassuranceTitle),
  reassuranceHint: kk(FAMILY_LANGUAGE.backup.reassuranceHint),
  exportJson: kk(FAMILY_LANGUAGE.backup.exportJson),
  exportJsonHint: kk(FAMILY_LANGUAGE.backup.exportJsonHint),
  exportPdf: kk(FAMILY_LANGUAGE.backup.exportPdf),
  exportPdfHint: kk(FAMILY_LANGUAGE.backup.exportPdfHint),
  manualBackup: kk(FAMILY_LANGUAGE.backup.manualBackup),
  manualBackupHint: kk(FAMILY_LANGUAGE.backup.manualBackupHint),
  restore: kk(FAMILY_LANGUAGE.backup.restore),
  restoreHint: kk(FAMILY_LANGUAGE.backup.restoreHint),
  restoreOwnerOnly: kk(FAMILY_LANGUAGE.backup.restoreOwnerOnly),
  lastBackup: kk(FAMILY_LANGUAGE.backup.lastBackup),
  noBackupYet: kk(FAMILY_LANGUAGE.backup.noBackupYet),
  noBackupHint: kk(FAMILY_LANGUAGE.backup.noBackupHint),
  working: kk(FAMILY_LANGUAGE.backup.working),
  exportDone: kk(FAMILY_LANGUAGE.backup.exportDone),
  exportDoneHint: kk(FAMILY_LANGUAGE.backup.exportDoneHint),
  manualDone: kk(FAMILY_LANGUAGE.backup.manualDone),
  manualDoneHint: kk(FAMILY_LANGUAGE.backup.manualDoneHint),
  restoreConfirmTitle: kk(FAMILY_LANGUAGE.backup.restoreConfirmTitle),
  restoreConfirmHint: kk(FAMILY_LANGUAGE.backup.restoreConfirmHint),
  restoreDone: kk(FAMILY_LANGUAGE.backup.restoreDone),
  restoreDoneHint: kk(FAMILY_LANGUAGE.backup.restoreDoneHint),
  cancelAction: kk(FAMILY_LANGUAGE.backup.cancelAction),
  restoreAction: kk(FAMILY_LANGUAGE.backup.restoreAction),
  openSettings: kk(FAMILY_LANGUAGE.backup.openSettings),
  openSettingsHint: kk(FAMILY_LANGUAGE.backup.openSettingsHint),
} as const;

export function restoreDoneHint(relatives: number, memories: number): string {
  return kk(FAMILY_LANGUAGE.backup.restoreDoneHint)
    .replace('{relatives}', String(relatives))
    .replace('{memories}', String(memories));
}
