import assert from 'node:assert/strict';
import test from 'node:test';

import { buildBauyrzhanLabFamily } from '@/services/kinship/lab/kinship-lab.fixtures';
import {
  getKinshipExplanation,
  getKinshipLabel,
  getThreeJurtGroup,
  invalidateKinshipCache,
  mapThreeJurtGroupToJurtKind,
} from '@/services/kinship.service';
import { prepareShezhireTreeView, resolveShezhireKinshipCardLine } from '@/services/shezhire-view.service';
import { buildJurtGroups, resolveJurtKind } from '@/utils/jurt-grouping';
import { kayinJurtHasPerson } from '@/utils/kayin-jurt-subgroups';
import { classifyOzJurtSubgroup } from '@/utils/oz-jurt-subgroups';

test('quality: spouse father is kayin ata in label, jurt, and card line', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, annaFather } = family.members;

  assert.equal(getKinshipLabel(bauyrzhan, annaFather, family.relatives).type, 'kayin_ata');
  assert.equal(getThreeJurtGroup(bauyrzhan, annaFather, family.relatives), 'kaiyn_jurt');
  assert.equal(resolveJurtKind(bauyrzhan, annaFather, family.relatives), 'kayin');
  assert.match(resolveShezhireKinshipCardLine(bauyrzhan, annaFather, family.relatives), /Қайын ата/);
});

test('quality: younger brother wife is kelin in oz jurt, never kayin', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, jenge } = family.members;

  assert.equal(getKinshipLabel(bauyrzhan, jenge, family.relatives).type, 'kelin');
  assert.notEqual(getThreeJurtGroup(bauyrzhan, jenge, family.relatives), 'kaiyn_jurt');
  assert.equal(resolveJurtKind(bauyrzhan, jenge, family.relatives), 'oz');
  assert.equal(
    classifyOzJurtSubgroup(
      getKinshipLabel(bauyrzhan, jenge, family.relatives),
      jenge,
      getKinshipLabel(bauyrzhan, jenge, family.relatives).label.kazakh,
    ),
    'kelinler',
  );
});

test('quality: root switch recalculates label and jurt instantly', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, anna, annaFather, brother } = family.members;

  assert.equal(getKinshipLabel(bauyrzhan, annaFather, family.relatives).type, 'kayin_ata');
  assert.equal(getKinshipLabel(brother, annaFather, family.relatives).type, 'kuda');
  assert.equal(getKinshipLabel(anna, annaFather, family.relatives).type, 'father');
  assert.equal(getKinshipLabel(bauyrzhan, anna, family.relatives).type, 'wife');
  assert.equal(getKinshipLabel(brother, anna, family.relatives).type, 'jenge');
  assert.equal(resolveJurtKind(brother, anna, family.relatives), 'oz');
  assert.equal(resolveJurtKind(bauyrzhan, anna, family.relatives), null);
});

test('quality: prepared shezhire bundles labels for all jurt members', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, annaFather, jenge, zhien } = family.members;
  const prepared = prepareShezhireTreeView(bauyrzhan, family.relatives);

  for (const person of [annaFather, jenge, zhien]) {
    assert.match(
      resolveShezhireKinshipCardLine(bauyrzhan, person, family.relatives),
      /./,
      `${person.id} should have a card label`,
    );
    assert.match(prepared.kinshipLabels.get(person.id) ?? '', /./);
  }
});

test('quality: kinship explanation stays calm and human for kayin ata', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, annaFather } = family.members;
  const explanation = getKinshipExplanation(bauyrzhan, annaFather, family.relatives);

  assert.match(explanation.summary, /жұбай/i);
  assert.match(explanation.summary, /қайын ата/i);
});

test('quality: kinship cache invalidates after structural parent link change', () => {
  const bauyrzhan = familyMember('b', 'Бауыржан', { gender: 'male', spouseId: 'an' });
  const anna = familyMember('an', 'Анна', { gender: 'female', spouseId: 'b' });
  const annaFather = familyMember('af', 'Абдулрашид', { gender: 'male' });

  const before = buildJurtGroups(bauyrzhan, [bauyrzhan, anna], new Set([bauyrzhan.id, anna.id]));
  assert.equal(kayinJurtHasPerson(before.kayin.subgroups ?? [], annaFather.id), false);

  anna.fatherId = annaFather.id;
  invalidateKinshipCache();
  const after = buildJurtGroups(
    bauyrzhan,
    [bauyrzhan, anna, annaFather],
    new Set([bauyrzhan.id, anna.id]),
  );

  assert.equal(resolveJurtKind(bauyrzhan, annaFather, [bauyrzhan, anna, annaFather]), 'kayin');
  assert.ok(kayinJurtHasPerson(after.kayin.subgroups ?? [], annaFather.id));
});

test('quality: jurt kind mapping stays consistent with three jurt group', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, nagAta, jenge, annaFather } = family.members;

  const cases = [
    { person: annaFather, expectedKind: 'kayin' },
    { person: nagAta, expectedKind: 'nagashy' },
    { person: jenge, expectedKind: 'oz' },
  ] as const;

  for (const { person, expectedKind } of cases) {
    const group = getThreeJurtGroup(bauyrzhan, person, family.relatives);
    assert.equal(
      resolveJurtKind(bauyrzhan, person, family.relatives),
      expectedKind,
      `${person.id}: ${group}`,
    );
    assert.equal(mapThreeJurtGroupToJurtKind(group), expectedKind, `${person.id}: ${group}`);
  }
});

function familyMember(
  id: string,
  firstName: string,
  options: Partial<import('@/types/relative').Relative> = {},
): import('@/types/relative').Relative {
  return {
    id,
    fullName: firstName,
    firstName,
    displayName: firstName,
    relationship: 'Туысы',
    birthday: '',
    phone: '',
    avatarColor: '#2C4A3E',
    isDeceased: false,
    ...options,
  };
}
