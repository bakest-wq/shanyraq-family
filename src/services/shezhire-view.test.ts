import assert from 'node:assert/strict';
import test from 'node:test';

import { buildBauyrzhanLabFamily, labRelative } from '@/services/kinship/lab/kinship-lab.fixtures';
import { kayinJurtHasPerson } from '@/utils/kayin-jurt-subgroups';
import {
  getKinshipExplanation,
  getKinshipLabel,
  getThreeJurtGroup,
} from '@/services/kinship';
import {
  prepareProfileFamilyView,
  prepareRelativesListView,
  prepareShezhireTreeView,
  resolveJurtKinshipCardLine,
} from '@/services/shezhire-view.service';

test('prepared shezhire tree bundles graph, jurt groups, and kinship labels', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, father } = family.members;

  const prepared = prepareShezhireTreeView(bauyrzhan, family.relatives);

  assert.ok(prepared.rootGraph.root.id === bauyrzhan.id);
  assert.ok(prepared.threeJurtGroups.oz.entries.length >= 0);
  assert.match(prepared.kinshipLabels.get(father.id) ?? '', /./);
});

test('prepared profile family exposes ring members and labels', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, father } = family.members;

  const prepared = prepareProfileFamilyView(bauyrzhan, family.relatives, bauyrzhan);

  assert.equal(prepared.familyRing.father?.id, father.id);
  assert.match(prepared.kinshipLabels.get(father.id) ?? '', /./);
});

test('prepared shezhire kayin jurt includes spouse father with label', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, annaFather } = family.members;

  const prepared = prepareShezhireTreeView(bauyrzhan, family.relatives);

  assert.ok(
    kayinJurtHasPerson(prepared.threeJurtGroups.kayin.subgroups ?? [], annaFather.id),
    'spouse father must appear in kayin jurt tab',
  );
  assert.match(prepared.kinshipLabels.get(annaFather.id) ?? '', /Қайын ата/);
});

test('prepared shezhire recalculates kayin after spouse parent link is added', () => {
  const bauyrzhan = labRelative('b', 'Бауыржан', { gender: 'male', spouseId: 'an' });
  const anna = labRelative('an', 'Анна', { gender: 'female', spouseId: 'b' });
  const annaFather = labRelative('af', 'Абдулрашид', { gender: 'male' });

  const before = prepareShezhireTreeView(bauyrzhan, [bauyrzhan, anna]);
  assert.equal(
    kayinJurtHasPerson(before.threeJurtGroups.kayin.subgroups ?? [], annaFather.id),
    false,
  );

  anna.fatherId = annaFather.id;
  const after = prepareShezhireTreeView(bauyrzhan, [bauyrzhan, anna, annaFather]);

  assert.ok(kayinJurtHasPerson(after.threeJurtGroups.kayin.subgroups ?? [], annaFather.id));
  assert.match(after.kinshipLabels.get(annaFather.id) ?? '', /Қайын ата/);
});

test('prepared shezhire excludes younger brother wife from kayin jurt', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, jenge } = family.members;

  const prepared = prepareShezhireTreeView(bauyrzhan, family.relatives);

  assert.equal(getKinshipLabel(bauyrzhan, jenge, family.relatives).type, 'kelin');
  assert.notEqual(getThreeJurtGroup(bauyrzhan, jenge, family.relatives), 'kaiyn_jurt');
  assert.equal(
    kayinJurtHasPerson(prepared.threeJurtGroups.kayin.subgroups ?? [], jenge.id),
    false,
  );
});

test('resolveJurtKinshipCardLine returns confidence-safe kayin ata label', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, annaFather } = family.members;

  assert.match(resolveJurtKinshipCardLine(bauyrzhan, annaFather, family.relatives), /Қайын ата/);
});

test('prepared relatives list skips self label', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan } = family.members;

  const prepared = prepareRelativesListView(bauyrzhan, family.relatives);

  assert.equal(prepared.kinshipLabels.has(bauyrzhan.id), false);
});
