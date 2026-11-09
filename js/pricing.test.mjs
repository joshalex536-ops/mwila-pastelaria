import { test } from 'node:test';
import assert from 'node:assert/strict';
import { price, fmt } from './pricing.js';

const base = { formato: 'redondo', tamanho: 'm', massa: 'baunilha', recheio: 'creme', cobertura: 'chantilly', extras: [] };

test('bolo médio redondo simples', () => {
  assert.equal(price(base).total, 24000 + 1500);
});

test('formato e tamanho mudam o preço', () => {
  assert.equal(price({ ...base, formato: 'coracao' }).total, 30000 + 1500);
  assert.equal(price({ ...base, tamanho: 'g' }).lines[2][1], Math.round((1500 * 35000 / 24000) / 100) * 100);
});

test('extras somam e aparecem na lista', () => {
  const p = price({ ...base, extras: ['morangos', 'confetes'] });
  assert.equal(p.total, 25500 + 4000);
  assert.equal(p.lines.length, 6);
});

test('formato de moeda', () => assert.equal(fmt(25500), '25 500 Kz'));
