import test from 'node:test';
import assert from 'node:assert/strict';
import { isLate, lateCategory, lateOccurrence } from '../lateRules.js';

test('masa tepat 07:30 tidak dikira lewat', () => {
  assert.equal(isLate('07:30:00'), false);
});

test('satu saat selepas 07:30 dikira lewat', () => {
  assert.equal(isLate('07:30:01'), true);
});

test('masa lewat biasa dan format tanpa saat dikenali', () => {
  assert.equal(isLate('07:31'), true);
  assert.equal(isLate('08:00:00'), true);
});

test('masa sebelum waktu akhir tidak lewat', () => {
  assert.equal(isLate('06:59:59'), false);
  assert.equal(isLate('07:29:59'), false);
});

test('format masa tidak sah tidak lewat', () => {
  assert.equal(isLate('7:30'), false);
  assert.equal(isLate('07:30 PM'), false);
  assert.equal(isLate(''), false);
  assert.equal(isLate(null), false);
});

test('kategori lewat 1 dan 2 ialah Ringan', () => {
  assert.equal(lateCategory(1), 'Ringan');
  assert.equal(lateCategory(2), 'Ringan');
});

test('kategori lewat 3 hingga 5 ialah Sederhana', () => {
  assert.equal(lateCategory(3), 'Sederhana');
  assert.equal(lateCategory(5), 'Sederhana');
});

test('kategori lewat 6 hingga 8 ialah Sederhana 2', () => {
  assert.equal(lateCategory(6), 'Sederhana 2');
  assert.equal(lateCategory(8), 'Sederhana 2');
});

test('kategori lewat 9 ke atas ialah Kesalahan Berat', () => {
  assert.equal(lateCategory(9), 'Kesalahan Berat');
  assert.equal(lateCategory(12), 'Kesalahan Berat');
});

test('nilai kategori yang tidak sah dikembalikan kosong', () => {
  assert.equal(lateCategory(0), '');
  assert.equal(lateCategory(-1), '');
  assert.equal(lateCategory(NaN), '');
});

test('bilangan lewat dikira mengikut kronologi', () => {
  const attendance = {
    '2026-10-27|Pagi': { murid1: { masa: '07:31:00' } },
    '2026-10-28|Pagi': { murid1: { masa: '07:45:00' } },
    '2026-10-29|Pagi': { murid1: { masa: '08:00:00' } }
  };
  assert.equal(lateOccurrence(attendance, 'murid1', '2026-10-27|Pagi'), 1);
  assert.equal(lateOccurrence(attendance, 'murid1', '2026-10-28|Pagi'), 2);
  assert.equal(lateOccurrence(attendance, 'murid1', '2026-10-29|Pagi'), 3);
});

test('rekod tepat 07:30 tidak membilang sebagai lewat', () => {
  const attendance = {
    '2026-10-27|Pagi': { murid1: { masa: '07:30:00' } },
    '2026-10-28|Pagi': { murid1: { masa: '07:31:00' } }
  };
  assert.equal(lateOccurrence(attendance, 'murid1', '2026-10-28|Pagi'), 1);
});

test('rekod murid lain atau data kosong tidak mengubah kiraan', () => {
  const attendance = {
    '2026-10-27|Pagi': { murid2: { masa: '08:00:00' } },
    '2026-10-28|Pagi': { murid1: { masa: '07:31:00' } }
  };
  assert.equal(lateOccurrence(attendance, 'murid1', '2026-10-28|Pagi'), 1);
  assert.equal(lateOccurrence({}, 'murid1', '2026-10-28|Pagi'), 0);
});
