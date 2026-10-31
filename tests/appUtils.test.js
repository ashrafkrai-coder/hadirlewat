import test from 'node:test';
import assert from 'node:assert/strict';
import { execUrl, matchSheetStudent, normalizedName, sanitize } from '../appUtils.js';

test('sanitize membersihkan ruang dan aksara berbahaya', () => {
  assert.equal(sanitize('  <Ali> & "Abu"  '), 'Ali Abu');
});

test('execUrl menerima deployment /exec dan menukar /dev kepada /exec', () => {
  assert.equal(
    execUrl('https://script.google.com/macros/s/deployment/dev'),
    'https://script.google.com/macros/s/deployment/exec'
  );
  assert.equal(execUrl('javascript:alert(1)', ''), '');
});

test('normalizedName menyelaraskan jarak dan huruf besar', () => {
  assert.equal(normalizedName('  Ali   Bin   Abu  '), 'ali bin abu');
});

test('padanan nama dan kelas Sheet mengenal pasti murid yang betul', () => {
  const students = [
    { id: '1', nama: 'Ali Abu', kelas: '1 Anggerik' },
    { id: '2', nama: 'Ali Abu', kelas: '1 Cempaka' }
  ];
  assert.equal(matchSheetStudent(students, { nama: 'Ali Abu', kelas: '1 Cempaka' }).id, '2');
});

test('kelas kosong dalam Sheet tidak menukar murid kelas yang sama nama', () => {
  const students = [{ id: '1', nama: 'Ali Abu', kelas: '1 Anggerik' }];
  assert.equal(matchSheetStudent(students, { nama: 'Ali Abu', kelas: '' }).id, '1');
});
