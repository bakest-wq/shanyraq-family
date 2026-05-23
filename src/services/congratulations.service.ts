import {
  CongratulationsInput,
  CongratulationsStyle,
} from '@/types/congratulations';
import { formatBirthdayKzRu, getAgeTurningOnNextBirthday, hasBirthday } from '@/utils/dates';

function pickVariant(variants: string[], seed: number): string {
  return variants[seed % variants.length];
}

function getTurningAge(input: CongratulationsInput): number | null {
  if (input.age !== null) {
    return input.age;
  }

  if (hasBirthday(input.birthday)) {
    return getAgeTurningOnNextBirthday(input.birthday);
  }

  return null;
}

function agePhrase(input: CongratulationsInput): string {
  const age = getTurningAge(input);
  if (age === null) {
    return 'туған күн';
  }
  return `${age} жасқа толу · ${age} лет`;
}

function relationshipPhrase(relationship: string): string {
  return relationship.toLowerCase();
}

function generateWarmFamily(input: CongratulationsInput, seed: number): string {
  const variants = [
    `Ассалаумағалейкум, ${input.fullName}!\n\nОт всего сердца поздравляем нашего дорогого ${relationshipPhrase(input.relationship)} с ${agePhrase(input)}!\n\nПусть дом всегда будет полон смеха, тепла и заботы. Мы рядом и любим вас очень сильно.\n\nС любовью, ваша семья Shanyraq 💚`,
    `Дорогой(ая) ${input.fullName}!\n\nСегодня особенный день — ${formatBirthdayKzRu(input.birthday)}. Спасибо, что ты — часть нашего шанырака.\n\nЖелаем здоровья, спокойствия и радости рядом с близкими.\n\nОбнимаем крепко!`,
    `${input.fullName}, құттықтаймыз!\n\nБіздің отбасы сені мейлінше жақсы көреді. ${agePhrase(input)} — жаңа бақытты кезеңнің басы.\n\nДенсаулық, береке және махаббат болсын!\n\nShanyraq Family`,
  ];

  return pickVariant(variants, seed);
}

function generateIslamic(input: CongratulationsInput, seed: number): string {
  const variants = [
    `Ассалаумағалейкум, ${input.fullName}!\n\n${agePhrase(input)} мубарак болсын. Аллаh денсаулық, береке және жақсылық нәсіп етсін.\n\nОтбасыңыздың шамы жарқын болсын, ризашылық үйіңізге орнасын.\n\nДұғамен, Shanyraq Family 🤲`,
    `Қадірлі ${input.relationship} ${input.fullName}!\n\nТуған күніңізбен! Аллаh разы болсын, жаннаттай бейбітшілік сізбен болсын.\n\nЖақсылық, сабыр және отбасы бақыты мол болсын.`,
    `${input.fullName}, туған күн qutty bolsyn!\n\nАллаh сізді сау-сalam сақтасын, отбасыңызға береке берсін.\n\n${agePhrase(input)} — Аллаh сізге жақсылық нәсіп етсін.`,
  ];

  return pickVariant(variants, seed);
}

function generateFormal(input: CongratulationsInput, seed: number): string {
  const variants = [
    `Уважаемый(ая) ${input.fullName}!\n\nПримите искренние поздравления с ${agePhrase(input)}.\n\nЖелаем Вам крепкого здоровья, благополучия и успехов во всех добрых начинаниях.\n\nС уважением, семья Shanyraq Family`,
    `Дорогой(ая) ${input.fullName}!\n\nОт имени всей нашей семьи поздравляем Вас с днём рождения (${formatBirthdayKzRu(input.birthday)}).\n\nПусть каждый новый год приносит радость, стабильность и гармонию.\n\nС наилучшими пожеланиями.`,
    `${input.fullName}, поздравляем!\n\nВ этот знаменательный день желаем Вам благополучия, мира и семейного тепла.\n\nПусть ${agePhrase(input)} станет началом новых радостных событий.`,
  ];

  return pickVariant(variants, seed);
}

function generateShortKz(input: CongratulationsInput, seed: number): string {
  const variants = [
    `${input.fullName}, туған күніңмен! 🎂\n${agePhrase(input)} мубарак!\nДенсаулық, бақыт, Shanyraq!`,
    `Құттықтаймыз, ${input.fullName}!\n${input.relationship} — отбасының керегі.\nБереке болсын! 💚`,
    `${input.fullName}, ${agePhrase(input)}!\nАссалаумағалейкум!\nОтбасыңмен бірге бол! 🏠`,
  ];

  return pickVariant(variants, seed);
}

function generateHumor(input: CongratulationsInput, seed: number): string {
  const variants = [
    `${input.fullName}, туған күн qutty! 🎉\n${agePhrase(input)} — демек, тәжірибе артады, бірақ біз саған барibir келеміз!\nТорт болсын, шаршау болmasın! 😄`,
    `Эй, ${input.fullName}! 🎂\nБүгін сенің күнің — демек, бізге дәмді шай ішуге bahana bar!\n${input.relationship} болғаның үшін рахмет, sen otbasymyzdyn juldusy!`,
    `${input.fullName}, quttyqtaimyz!\n${agePhrase(input)} — jas artady, biraq otbasylyq jyladylyq erteng de sol!\nWhatsApp-ta kutip turmyz! 😊`,
  ];

  return pickVariant(variants, seed);
}

const generators: Record<
  CongratulationsStyle,
  (input: CongratulationsInput, seed: number) => string
> = {
  'warm-family': generateWarmFamily,
  islamic: generateIslamic,
  formal: generateFormal,
  'short-kz': generateShortKz,
  humor: generateHumor,
};

export const congratulationsService = {
  generate(
    style: CongratulationsStyle,
    input: CongratulationsInput,
    seed = Date.now(),
  ): string {
    const generator = generators[style];
    return generator(input, Math.abs(seed));
  },

  buildInputFromRelative(
    relative: {
      fullName: string;
      relationship: string;
      birthday: string;
    },
    age: number | null,
  ): CongratulationsInput {
    return {
      fullName: relative.fullName,
      relationship: relative.relationship,
      age,
      birthday: relative.birthday,
    };
  },
};
