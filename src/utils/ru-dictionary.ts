import { RU_DICTIONARY_SEED, RuDictionaryRecord } from '@/data/ru-dictionary.seed';

export type RuSelection = {
  zhuz: string;
  ru: string;
  tribeBranch: string;
  ataLine: string;
};

export type RuPickerStep = 'zhuz' | 'ru' | 'branch' | 'ataLine';

export type RuDictionaryOption = {
  value: string;
  labelKz: string;
  labelRu: string;
};

const dictionary = RU_DICTIONARY_SEED;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function uniqueOptions(
  records: RuDictionaryRecord[],
  pick: (record: RuDictionaryRecord) => { value: string; labelKz: string; labelRu: string },
): RuDictionaryOption[] {
  const map = new Map<string, RuDictionaryOption>();

  for (const record of records) {
    const option = pick(record);
    if (!option.value.trim()) {
      continue;
    }

    if (!map.has(option.value)) {
      map.set(option.value, option);
    }
  }

  return [...map.values()].sort((a, b) => a.labelKz.localeCompare(b.labelKz, 'kk'));
}

export function getZhuzOptions(): RuDictionaryOption[] {
  return uniqueOptions(dictionary, (record) => ({
    value: record.zhuz,
    labelKz: record.zhuz,
    labelRu: record.zhuzRu,
  }));
}

export function getRuOptions(zhuz: string): RuDictionaryOption[] {
  return uniqueOptions(
    dictionary.filter((record) => record.zhuz === zhuz),
    (record) => ({
      value: record.ru,
      labelKz: record.ru,
      labelRu: record.ruRu,
    }),
  );
}

export function getBranchOptions(zhuz: string, ru: string): RuDictionaryOption[] {
  return uniqueOptions(
    dictionary.filter((record) => record.zhuz === zhuz && record.ru === ru),
    (record) => ({
      value: record.branch,
      labelKz: record.branch,
      labelRu: record.branchRu,
    }),
  );
}

export function getAtaLineOptions(zhuz: string, ru: string, branch: string): RuDictionaryOption[] {
  return uniqueOptions(
    dictionary.filter(
      (record) => record.zhuz === zhuz && record.ru === ru && record.branch === branch,
    ),
    (record) => ({
      value: record.ataLine,
      labelKz: record.ataLine,
      labelRu: record.ataLineRu,
    }),
  );
}

export function searchRuDictionary(query: string): RuDictionaryRecord[] {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return [];
  }

  return dictionary.filter((record) => {
    const haystack = [
      record.zhuz,
      record.zhuzRu,
      record.ru,
      record.ruRu,
      record.branch,
      record.branchRu,
      record.ataLine,
      record.ataLineRu,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function recordToSelection(record: RuDictionaryRecord): RuSelection {
  return {
    zhuz: record.zhuz,
    ru: record.ru,
    tribeBranch: record.branch,
    ataLine: record.ataLine,
  };
}

export function hasRuSelection(selection: Partial<RuSelection>): boolean {
  return Boolean(
    selection.zhuz?.trim() ||
      selection.ru?.trim() ||
      selection.tribeBranch?.trim() ||
      selection.ataLine?.trim(),
  );
}

export function formatRuSelectionSummary(selection: Partial<RuSelection>): string {
  const parts = [
    selection.zhuz?.trim(),
    selection.ru?.trim(),
    selection.tribeBranch?.trim(),
    selection.ataLine?.trim(),
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' · ') : 'Таңдалмаған · Не выбрано';
}

export function formatRuSelectionPath(selection: Partial<RuSelection>): string[] {
  return [
    selection.zhuz?.trim(),
    selection.ru?.trim(),
    selection.tribeBranch?.trim(),
    selection.ataLine?.trim(),
  ].filter((value): value is string => Boolean(value));
}

export function matchesDictionarySelection(selection: Partial<RuSelection>): boolean {
  if (!hasRuSelection(selection)) {
    return false;
  }

  return dictionary.some(
    (record) =>
      record.zhuz === selection.zhuz &&
      record.ru === selection.ru &&
      record.branch === selection.tribeBranch &&
      record.ataLine === selection.ataLine,
  );
}

export function getStepTitle(step: RuPickerStep): string {
  switch (step) {
    case 'zhuz':
      return '1. Жүз таңдау · Выберите жуз';
    case 'ru':
      return '2. Ру таңдау · Выберите ру';
    case 'branch':
      return '3. Тармақ таңдау · Выберите тармак';
    case 'ataLine':
      return '4. Ата тегі · Выберите ата тег';
  }
}

export function getStepOptions(
  step: RuPickerStep,
  draft: Partial<RuSelection>,
): RuDictionaryOption[] {
  switch (step) {
    case 'zhuz':
      return getZhuzOptions();
    case 'ru':
      return draft.zhuz ? getRuOptions(draft.zhuz) : [];
    case 'branch':
      return draft.zhuz && draft.ru ? getBranchOptions(draft.zhuz, draft.ru) : [];
    case 'ataLine':
      return draft.zhuz && draft.ru && draft.tribeBranch
        ? getAtaLineOptions(draft.zhuz, draft.ru, draft.tribeBranch)
        : [];
  }
}

export function formatSearchResultLabel(record: RuDictionaryRecord): string {
  return `${record.zhuz} · ${record.ru} · ${record.branch} · ${record.ataLine}`;
}

export function formatSearchResultSubtitle(record: RuDictionaryRecord): string {
  return `${record.zhuzRu} · ${record.ruRu}`;
}
