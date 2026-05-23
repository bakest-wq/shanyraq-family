export const GRAPH_INTEGRITY_COPY = {
  deleteBlocked:
    'Бұл адам басқа байланыстарда қолданылып тұр',
  deleteBlockedHint:
    'Жою алдында байланыстарды тазарта аласыз · Clear links first, then delete',
  clearReferences: 'Байланыстарды тазарту',
  deleteAfterClear: 'Енді жоюға болады',
  affectedRelatives: 'Байланысты туыс:',
  healthCheckTitle: 'Шежірені тексеру',
  healthCheckSubtitle: 'Отбасы деректерінің сапасын тексеру · Family data health',
  allClear: 'Шежіре деректері таза көрінеді 🌿',
  allClearHint: 'Барлық байланыстар дұрыс · No issues found',
  sections: {
    brokenParents: 'Жарамсыз ата-ана байланыстары',
    brokenSpouses: 'Жарамсыз жұбай байланыстары',
    duplicates: 'Қайталануы мүмкін адамдар',
    circular: 'Шеңберлі ата-ана байланыстары',
    invalidChildParent: 'Қате ата-ана/бala байланыстары',
    orphans: 'Ағашта орны анық емес',
  },
  repairs: {
    clearBrokenParents: 'Жарамсыз ата-ана сілтемелерін тазарту',
    syncSpouses: 'Жұбай байланысын екі жаққа синхрондау',
    clearOrphanRefs: 'Жоқ туысқа сілтемелерді жою',
    runAllSafe: 'Қауіпсіз түзетулерді қолдану',
    applied: 'Түзетулер сақталды 🌿',
  },
  validation: {
    siblingAsParent: 'Бауырды ата-ана ретінде сақтауға болмайды',
    siblingAsChild: 'Бауырды бала ретінде сақтауға болмайды',
  },
} as const;
