import assert from 'node:assert/strict';
import test from 'node:test';

import { buildBauyrzhanLabFamily, labRelative } from '@/services/kinship/lab/kinship-lab.fixtures';
import { buildJurtGroups } from '@/utils/jurt-grouping';
import {
  buildOzJurtSubgroups,
  classifyOzJurtSubgroup,
  countOzJurtSubgroup,
  filterVisibleOzJurtSubgroups,
  OZ_JURT_SUBGROUP_ORDER,
  type OzJurtSubgroupId,
} from '@/utils/oz-jurt-subgroups';
import { getKinshipLabel } from '@/utils/kinship/getKinshipLabel';

function findSubgroup(
  subgroups: ReturnType<typeof buildOzJurtSubgroups>,
  id: OzJurtSubgroupId,
) {
  return subgroups.find((subgroup) => subgroup.id === id);
}

function subgroupHasPerson(subgroup: ReturnType<typeof findSubgroup>, personId: string): boolean {
  if (!subgroup) {
    return false;
  }

  return (
    subgroup.entries.some((entry) => entry.person.id === personId) ||
    subgroup.extraRelatives.some((person) => person.id === personId) ||
    subgroup.entries.some((entry) => entry.children.some((child) => child.id === personId))
  );
}

test('classifyOzJurtSubgroup splits sibling in-laws into kelinler, jengeler, jezdelder', () => {
  assert.equal(classifyOzJurtSubgroup({ type: 'aga' } as never), 'siblings');
  assert.equal(
    classifyOzJurtSubgroup({ type: 'kelin', label: { kazakh: 'Келін' } } as never, { gender: 'female' } as never, 'Келін'),
    'kelinler',
  );
  assert.equal(
    classifyOzJurtSubgroup({ type: 'jenge', label: { kazakh: 'Жеңге' } } as never, { gender: 'female' } as never, 'Жеңге'),
    'jengeler',
  );
  assert.equal(
    classifyOzJurtSubgroup(
      { type: 'brother_wife_neutral', label: { kazakh: 'Бауырының жұбайы' } } as never,
      { gender: 'female' } as never,
      'Бауырының жұбайы',
    ),
    'jengeler',
  );
  assert.equal(
    classifyOzJurtSubgroup({ type: 'jezde', label: { kazakh: 'Жезде' } } as never, { gender: 'male' } as never, 'Жезде'),
    'jezdelder',
  );
  assert.equal(classifyOzJurtSubgroup({ type: 'kuda' } as never), 'kuda');
  assert.equal(classifyOzJurtSubgroup({ type: 'brother_child_younger' } as never), 'brotherChildren');
  assert.equal(classifyOzJurtSubgroup({ type: 'zhien' } as never), 'niecesNephews');
  assert.equal(classifyOzJurtSubgroup({ type: 'paternal_aga' } as never), 'paternalRelatives');
});

test('lab family: younger brother wife lands in kelinler, not jengeler or jezdelder', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, brother, jenge, zhien } = family.members;
  const excludeIds = new Set<string>([
    bauyrzhan.id,
    family.members.father.id,
    family.members.mother.id,
    family.members.anna.id,
    brother.id,
    family.members.sister.id,
  ]);

  const groups = buildJurtGroups(bauyrzhan, family.relatives, excludeIds);
  const subgroups = groups.oz.subgroups ?? [];

  assert.ok(subgroups.length > 0);

  const kelinler = findSubgroup(subgroups, 'kelinler');
  const jengeler = findSubgroup(subgroups, 'jengeler');
  const jezdelder = findSubgroup(subgroups, 'jezdelder');
  const niecesNephews = findSubgroup(subgroups, 'niecesNephews');
  const siblings = findSubgroup(subgroups, 'siblings');

  assert.equal(getKinshipLabel(bauyrzhan, jenge, family.relatives).type, 'kelin');
  assert.equal(subgroupHasPerson(kelinler, jenge.id), true);
  assert.equal(subgroupHasPerson(jengeler, jenge.id), false);
  assert.equal(subgroupHasPerson(jezdelder, jenge.id), false);
  assert.equal(subgroupHasPerson(siblings, jenge.id), false);
  assert.equal(subgroupHasPerson(siblings, brother.id), false, 'main-tree siblings stay excluded');

  assert.equal(getKinshipLabel(bauyrzhan, zhien, family.relatives).type, 'zhien');
  assert.equal(subgroupHasPerson(niecesNephews, zhien.id), true);
  assert.equal(subgroupHasPerson(kelinler, zhien.id), false);
});

test('brother children go to brotherChildren subgroup, not niecesNephews', () => {
  const family = buildBauyrzhanLabFamily();
  const brotherChild = labRelative('bro-child', 'Абдулла', {
    gender: 'male',
    fatherId: family.members.brother.id,
    motherId: 'ext-m',
  });
  const relatives = [...family.relatives, brotherChild];
  const { bauyrzhan, brother } = family.members;
  const excludeIds = new Set<string>([
    bauyrzhan.id,
    family.members.father.id,
    family.members.mother.id,
    family.members.anna.id,
    brother.id,
    family.members.sister.id,
  ]);

  const groups = buildJurtGroups(bauyrzhan, relatives, excludeIds);
  const subgroups = groups.oz.subgroups ?? [];
  const brotherChildren = findSubgroup(subgroups, 'brotherChildren');
  const niecesNephews = findSubgroup(subgroups, 'niecesNephews');

  assert.notEqual(getKinshipLabel(bauyrzhan, brotherChild, relatives).type, 'zhien');
  assert.equal(subgroupHasPerson(brotherChildren, brotherChild.id), true);
  assert.equal(subgroupHasPerson(niecesNephews, brotherChild.id), false);
});

test('oz subgroup count matches visible relatives', () => {
  const family = buildBauyrzhanLabFamily();
  const groups = buildJurtGroups(family.members.bauyrzhan, family.relatives, new Set([family.members.bauyrzhan.id]));

  const visibleCount = (groups.oz.subgroups ?? [])
    .filter((subgroup) => countOzJurtSubgroup(subgroup) > 0)
    .reduce((total, subgroup) => total + countOzJurtSubgroup(subgroup), 0);

  assert.equal(visibleCount, groups.oz.entries.length + groups.oz.extraRelatives.length);
});

test('oz subgroups expose eight structured sections in kinship order', () => {
  const family = buildBauyrzhanLabFamily();
  const groups = buildJurtGroups(family.members.bauyrzhan, family.relatives, new Set([family.members.bauyrzhan.id]));
  const subgroups = groups.oz.subgroups ?? [];

  assert.equal(subgroups.length, 8);
  assert.deepEqual(
    subgroups.map((subgroup) => subgroup.id),
    OZ_JURT_SUBGROUP_ORDER,
  );
});

test('filterVisibleOzJurtSubgroups drops empty buckets including kuda', () => {
  const family = buildBauyrzhanLabFamily();
  const groups = buildJurtGroups(family.members.bauyrzhan, family.relatives, new Set([family.members.bauyrzhan.id]));
  const subgroups = groups.oz.subgroups ?? [];
  const visible = filterVisibleOzJurtSubgroups(subgroups);

  assert.ok(visible.length > 0);
  assert.ok(visible.length <= subgroups.length);
  assert.ok(visible.every((subgroup) => countOzJurtSubgroup(subgroup) > 0));

  const emptyKuda = subgroups.find((subgroup) => subgroup.id === 'kuda');
  if (emptyKuda && countOzJurtSubgroup(emptyKuda) === 0) {
    assert.equal(
      visible.some((subgroup) => subgroup.id === 'kuda'),
      false,
      'empty kuda bucket must not appear in visible list',
    );
  }
});

test('filterVisibleOzJurtSubgroups returns empty list when all buckets are empty', () => {
  const emptyBuckets = buildOzJurtSubgroups(
    { id: 'root', firstName: 'Root', gender: 'male' } as never,
    [],
    new Set(['root']),
    [],
    [],
  );

  assert.equal(emptyBuckets.length, 8);
  assert.deepEqual(filterVisibleOzJurtSubgroups(emptyBuckets), []);
});
