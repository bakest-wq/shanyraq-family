import { bilingual, kk, FAMILY_LANGUAGE, phraseWithName, phraseWithToken } from '@/content/family-language';

export type HomeTimeOfDay = 'morning' | 'afternoon' | 'evening';

export type HomeGreeting = {
  salam: string;
  timeGreeting: string;
  headline: string;
  subline: string;
};

export function getHomeTimeOfDay(referenceDate = new Date()): HomeTimeOfDay {
  const hour = referenceDate.getHours();

  if (hour < 12) {
    return 'morning';
  }

  if (hour < 18) {
    return 'afternoon';
  }

  return 'evening';
}

function getTimeGreeting(timeOfDay: HomeTimeOfDay): string {
  switch (timeOfDay) {
    case 'morning':
      return kk(FAMILY_LANGUAGE.home.greetingMorning);
    case 'afternoon':
      return kk(FAMILY_LANGUAGE.home.greetingAfternoon);
    default:
      return kk(FAMILY_LANGUAGE.home.greetingEvening);
  }
}

export function buildHomeGreeting(options: {
  familyName: string;
  userName?: string | null;
  referenceDate?: Date;
}): HomeGreeting {
  const timeOfDay = getHomeTimeOfDay(options.referenceDate);
  const familyName = options.familyName.trim() || 'Отбасы';
  const userName = options.userName?.trim();

  return {
    salam: kk(FAMILY_LANGUAGE.home.greetingSalam),
    timeGreeting: getTimeGreeting(timeOfDay),
    headline: userName
      ? phraseWithName(FAMILY_LANGUAGE.home.greetingPersonalLine, userName).kk
      : kk(FAMILY_LANGUAGE.home.greetingQuietLine),
    subline: bilingual(phraseWithToken(FAMILY_LANGUAGE.home.greetingFamilyLine, 'family', familyName)),
  };
}
