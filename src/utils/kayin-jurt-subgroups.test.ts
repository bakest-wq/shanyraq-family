import assert from 'node:assert/strict';
import test from 'node:test';

import { buildBauyrzhanLabFamily } from '@/services/kinship/lab/kinship-lab.fixtures';
import { buildJurtGroups } from '@/utils/jurt-grouping';
import {
  buildKayinJurtSubgroups,
  classifyKayinJurtSubgroup,
  countKayinJurtSubgroup,
  filterVisibleKayinJurtSubgroups,
  kayinJurtHasPerson,
  type KayinJurtSubgroupId,
} from '@/utils/kayin-jurt-subgroups';

function findKayinSubgroup(
  subgroups: ReturnType<typeof buildKayinJurtSubgroups>,
  id: KayinJurtSubgroupId,
) {
  return subgroups.find((subgroup) => subgroup.id === id);
}

test('classifyKayinJurtSubgroup routes in-law parents, siblings, and kuda', () => {
  assert.equal(classifyKayinJurtSubgroup({ type: 'kayin_ata' } as never), 'kayin_ata_ene');
  assert.equal(classifyKayinJurtSubgroup({ type: 'kayin_ene' } as never), 'kayin_ata_ene');
  assert.equal(classifyKayinJurtSubgroup({ type: 'kayin_aga' } as never), 'kayin_siblings');
  assert.equal(classifyKayinJurtSubgroup({ type: 'kayin_ini' } as never), 'kayin_siblings');
  assert.equal(classifyKayinJurtSubgroup({ type: 'kayin_apke' } as never), 'kayin_siblings');
  assert.equal(classifyKayinJurtSubgroup({ type: 'kayin_singli' } as never), 'kayin_siblings');
  assert.equal(classifyKayinJurtSubgroup({ type: 'kuda' } as never), 'kuda');
  assert.equal(classifyKayinJurtSubgroup({ type: 'kudagi' } as never), 'kuda');
});

test('lab family: spouse father lands in kayin_ata_ene subgroup', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, anna, annaFather } = family.members;
  const excludeIds = new Set<string>([
    bauyrzhan.id,
    family.members.father.id,
    family.members.mother.id,
    anna.id,
  ]);

  const groups = buildJurtGroups(bauyrzhan, family.relatives, excludeIds);
  const subgroups = groups.kayin.subgroups ?? [];

  assert.ok(subgroups.length > 0);
  assert.ok(kayinJurtHasPerson(subgroups, annaFather.id));

  const ataEne = findKayinSubgroup(subgroups, 'kayin_ata_ene');
  assert.ok(ataEne);
  assert.ok(
    ataEne.entries.some((entry) => entry.person.id === annaFather.id) ||
      ataEne.extraRelatives.some((person) => person.id === annaFather.id),
  );
});

test('filterVisibleKayinJurtSubgroups hides empty buckets', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, annaFather } = family.members;
  const excludeIds = new Set<string>([
    bauyrzhan.id,
    family.members.father.id,
    family.members.mother.id,
    family.members.anna.id,
  ]);

  const groups = buildJurtGroups(bauyrzhan, family.relatives, excludeIds);
  const visible = filterVisibleKayinJurtSubgroups(groups.kayin.subgroups ?? []);

  assert.ok(visible.every((subgroup) => countKayinJurtSubgroup(subgroup) > 0));
  assert.ok(visible.some((subgroup) => kayinJurtHasPerson([subgroup], annaFather.id)));
});

test('spouse-only child never lands in kayin_siblings', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, anna } = family.members;
  const spouseOnlyChild = {
    ...family.members.son,
    id: 'spouse-only-child',
    firstName: 'Балапан',
    fatherId: undefined,
    motherId: anna.id,
  };
  const relatives = [...family.relatives, spouseOnlyChild];
  const groups = buildJurtGroups(bauyrzhan, relatives, new Set([bauyrzhan.id]));

  assert.equal(kayinJurtHasPerson(groups.kayin.subgroups ?? [], spouseOnlyChild.id), false);
});
