import assert from 'node:assert/strict';
import test from 'node:test';

import { labRelative } from '@/services/kinship/lab/kinship-lab.fixtures';
import { buildBauyrzhanLabFamily } from '@/services/kinship/lab/kinship-lab.fixtures';
import { buildShezhireMainTreeExcludeIds, buildShezhireRootGraph } from '@/services/family-graph.service';
import { getThreeJurtGroup } from '@/services/kinship/kinship-groups';
import { isCoreFamilyRelation } from '@/utils/core-family-relation';
import { buildJurtGroups, resolveJurtKind } from '@/utils/jurt-grouping';
import { kayinJurtHasPerson } from '@/utils/kayin-jurt-subgroups';

function jurtHasPerson(
  groups: ReturnType<typeof buildJurtGroups>,
  personId: string,
): boolean {
  for (const group of [groups.kayin, groups.oz, groups.nagashy]) {
    if (group.subgroups?.length) {
      for (const subgroup of group.subgroups) {
        if (
          subgroup.entries.some((entry) => entry.person.id === personId) ||
          subgroup.extraRelatives.some((person) => person.id === personId) ||
          subgroup.entries.some((entry) => entry.children.some((child) => child.id === personId))
        ) {
          return true;
        }
      }
    }

    if (
      group.entries.some((entry) => entry.person.id === personId) ||
      group.extraRelatives.some((person) => person.id === personId) ||
      group.entries.some((entry) => entry.children.some((child) => child.id === personId))
    ) {
      return true;
    }
  }

  return false;
}

test('isCoreFamilyRelation: spouse, parents, children, siblings', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, father, mother, anna, son, brother, sister } = family.members;

  assert.equal(isCoreFamilyRelation(bauyrzhan, anna, family.relatives), true);
  assert.equal(isCoreFamilyRelation(bauyrzhan, father, family.relatives), true);
  assert.equal(isCoreFamilyRelation(bauyrzhan, mother, family.relatives), true);
  assert.equal(isCoreFamilyRelation(bauyrzhan, son, family.relatives), true);
  assert.equal(isCoreFamilyRelation(bauyrzhan, brother, family.relatives), true);
  assert.equal(isCoreFamilyRelation(bauyrzhan, sister, family.relatives), true);
});

test('spouse-only child link is still core family', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, anna } = family.members;
  const spouseOnlyChild = labRelative('spouse-child', 'Балапан', {
    gender: 'male',
    motherId: anna.id,
  });
  const relatives = [...family.relatives, spouseOnlyChild];

  assert.equal(isCoreFamilyRelation(bauyrzhan, spouseOnlyChild, relatives), true);
  assert.equal(getThreeJurtGroup(bauyrzhan, spouseOnlyChild, relatives), 'direct_family');
  assert.equal(resolveJurtKind(bauyrzhan, spouseOnlyChild, relatives), null);
  assert.equal(jurtHasPerson(buildJurtGroups(bauyrzhan, relatives, new Set([bauyrzhan.id])), spouseOnlyChild.id), false);
});

test('root children never appear in any ush jurt tab', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, son } = family.members;
  const groups = buildJurtGroups(bauyrzhan, family.relatives, new Set([bauyrzhan.id]));

  assert.equal(jurtHasPerson(groups, son.id), false);
  assert.equal(getThreeJurtGroup(bauyrzhan, son, family.relatives), 'direct_family');
  assert.equal(resolveJurtKind(bauyrzhan, son, family.relatives), null);
});

test('root spouse never duplicated in ush jurt tabs', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, anna } = family.members;
  const groups = buildJurtGroups(bauyrzhan, family.relatives, new Set([bauyrzhan.id]));

  assert.equal(jurtHasPerson(groups, anna.id), false);
  assert.equal(getThreeJurtGroup(bauyrzhan, anna, family.relatives), 'direct_family');
  assert.equal(resolveJurtKind(bauyrzhan, anna, family.relatives), null);
});

test('root parents never duplicated in ush jurt tabs', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, father, mother } = family.members;
  const groups = buildJurtGroups(bauyrzhan, family.relatives, new Set([bauyrzhan.id]));

  assert.equal(jurtHasPerson(groups, father.id), false);
  assert.equal(jurtHasPerson(groups, mother.id), false);
  assert.equal(getThreeJurtGroup(bauyrzhan, father, family.relatives), 'direct_family');
  assert.equal(getThreeJurtGroup(bauyrzhan, mother, family.relatives), 'direct_family');
});

test('root siblings never duplicated in ush jurt tabs', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, brother, sister } = family.members;
  const groups = buildJurtGroups(bauyrzhan, family.relatives, new Set([bauyrzhan.id]));

  assert.equal(jurtHasPerson(groups, brother.id), false);
  assert.equal(jurtHasPerson(groups, sister.id), false);
  assert.equal(getThreeJurtGroup(bauyrzhan, brother, family.relatives), 'direct_family');
  assert.equal(getThreeJurtGroup(bauyrzhan, sister, family.relatives), 'direct_family');
});

test('prepared exclude ids plus core guard keep son out of kayin jurt', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, son } = family.members;
  const rootGraph = buildShezhireRootGraph(bauyrzhan, family.relatives);
  const excludeIds = buildShezhireMainTreeExcludeIds(rootGraph);
  const groups = buildJurtGroups(bauyrzhan, family.relatives, excludeIds);

  assert.equal(kayinJurtHasPerson(groups.kayin.subgroups ?? [], son.id), false);
  assert.equal(jurtHasPerson(groups, son.id), false);
});
