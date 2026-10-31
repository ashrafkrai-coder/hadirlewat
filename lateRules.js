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
  const occurrences = [];
  Object.entries(attendance || {}).forEach(([key, records]) => {
    const [tarikh, ...sesiParts] = key.split('|');
    const record = records && records[studentId];
    if (record && isLate(record.masa)) {
      occurrences.push({ key, sort: `${tarikh}|${sesiParts.join('|')}|${record.masa}` });
    }
  });
  occurrences.sort((a, b) => a.sort.localeCompare(b.sort, 'ms'));
  const index = occurrences.findIndex((occurrence) => occurrence.key === recordKey);
  return index >= 0 ? index + 1 : 0;
}
