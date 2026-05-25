import { bilingual } from '@/content/family-language';

export const ROOT_IDENTITY_COPY = {
  meLabel: 'Мен',
  viewingAs: (name: string) => `Көрініс: ${name}`,
  viewingHint: bilingual({
    kk: 'Байланыс атаулары осы тұлғаға қарай есептеледі',
    ru: 'Связи показаны относительно этого человека',
  }),
  backToMe: bilingual({
    kk: 'Мен',
    ru: 'Я',
  }),
  backToMeHint: bilingual({
    kk: 'Өзіңіздің көру режиміне оралу',
    ru: 'Вернуться к своему виду',
  }),
  rootSelf: 'Орталық тұлға',
} as const;
