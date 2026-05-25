import assert from 'node:assert/strict';
import test from 'node:test';

import { buildBauyrzhanLabFamily, labRelative } from '@/services/kinship/lab/kinship-lab.fixtures';
import {
  classifyOzJurtSubgroupByPrimaryLabel,
  getPrimaryKinshipLabel,
  getPrimaryPreciseKinshipLabel,
  pickPrimaryKinshipResult,
  resolvePrimaryKinshipCandidates,
} from '@/services/kinship/kinship-priority';
import { buildKinshipResult } from '@/utils/kinship/classify-helpers';
import { classifyOzJurtSubgroup } from '@/utils/oz-jurt-subgroups';

test('pickPrimaryKinshipResult: root spouse overrides kelin', () => {
  const primary = pickPrimaryKinshipResult([
    buildKinshipResult('kelin'),
    buildKinshipResult('wife'),
  ]);

  assert.equal(primary?.type, 'wife');
  assert.equal(primary?.label.kazakh, 'Әйелі');
});

test('pickPrimaryKinshipResult: root spouse overrides jenge', () => {
  const primary = pickPrimaryKinshipResult([
    buildKinshipResult('jenge'),
    buildKinshipResult('wife'),
  ]);

  assert.equal(primary?.type, 'wife');
  assert.equal(primary?.label.kazakh, 'Әйелі');
});

test('Bauyrzhan root: Anna uses wife label, not kelin or jenge', () => {
  const family = buildBauyrzhanLabFamily();
  const { bauyrzhan, anna } = family.members;

  const candidates = resolvePrimaryKinshipCandidates(bauyrzhan, anna, family.relatives);
  const hasSpouseCandidate = candidates.some((candidate) => candidate.type === 'wife');
  const hasInLawCandidate = candidates.some((candidate) =>
    candidate.type === 'kelin' || candidate.type === 'jenge',
  );

  assert.equal(hasSpouseCandidate, true);
  assert.equal(hasInLawCandidate, false);
  assert.equal(getPrimaryPreciseKinshipLabel(bauyrzhan, anna, family.relatives), 'Әйелі');
  assert.equal(getPrimaryKinshipLabel(bauyrzhan, anna, family.relatives), 'Әйелі');
});

test('women never land in jezdelder via primary label grouping', () => {
  const woman = labRelative('woman', 'Эльмира', { gender: 'female' });

  assert.equal(classifyOzJurtSubgroupByPrimaryLabel('Жезде', woman), 'jengeler');
  assert.equal(
    classifyOzJurtSubgroup(
      buildKinshipResult('jezde'),
      woman,
      'Жезде',
    ),
    'jengeler',
  );
});

test('men never land in jengeler via primary label grouping', () => {
  const man = labRelative('man', 'Марат', { gender: 'male' });

  assert.equal(classifyOzJurtSubgroupByPrimaryLabel('Жеңге', man), 'jezdelder');
  assert.equal(
    classifyOzJurtSubgroup(
      buildKinshipResult('jenge'),
      man,
      'Жеңге',
    ),
    'jezdelder',
  );
});
