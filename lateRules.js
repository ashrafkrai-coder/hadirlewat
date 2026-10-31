export function isLate(masa) {
  if (!/^\d{2}:\d{2}(?::\d{2})?$/.test(String(masa || ''))) return false;
  const [jam, minit, saat = '0'] = String(masa).split(':');
  const totalSaat = Number(jam) * 3600 + Number(minit) * 60 + Number(saat);
  return totalSaat > 7 * 3600 + 30 * 60;
}

export function lateCategory(kali) {
  if (!Number.isFinite(kali) || kali < 1) return '';
  if (kali >= 9) return 'Kesalahan Berat';
  if (kali >= 6) return 'Sederhana 2';
  if (kali >= 3) return 'Sederhana';
  return 'Ringan';
}

export function lateOccurrence(attendance, studentId, recordKey) {
  if (!Object.prototype.hasOwnProperty.call(attendance || {}, recordKey)) return 0;
  const current = attendance[recordKey]?.[studentId];
  if (!current || !isLate(current.masa)) return 0;
  return [...Object.entries(attendance || {})]
    .filter(([, records]) => records?.[studentId] && isLate(records[studentId].masa))
    .sort(([a, aRecords], [b, bRecords]) => (
      `${a}|${aRecords[studentId].masa}`.localeCompare(
        `${b}|${bRecords[studentId].masa}`,
        'ms'
      )
    ))
    .findIndex(([key]) => key === recordKey) + 1;
}
