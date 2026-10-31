export function sanitize(value, maxLength = 120) {
  return String(value ?? '')
    .replace(/[<>&"'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function normalizedName(value) {
  return sanitize(value, 120).toLocaleLowerCase('ms').replace(/\s+/g, ' ');
}

export function execUrl(value, fallback = '') {
  const raw = sanitize(value, 2048) || fallback;
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    url.hash = '';
    url.pathname = url.pathname.replace(/\/(?:dev|exec)\/?$/, '/exec');
    if (!/\/exec\/?$/.test(url.pathname)) return '';
    return url.toString();
  } catch {
    return '';
  }
}

export function matchSheetStudent(students, row) {
  const name = normalizedName(row && row.nama);
  const className = normalizedName(row && row.kelas);
  if (!name) return null;
  return students.find((student) => {
    const studentClass = normalizedName(student.kelas);
    return normalizedName(student.nama) === name && (!className || !studentClass || studentClass === className);
  }) || null;
}

export function studentLevel(className) {
  const value = String(className || '').trim();
  const match = value.match(/(?:tingkatan\s*|form\s*|^T\s*)([1-5])/i)
    || value.match(/^([1-5])(?:\s|$)/);
  return match ? `Tingkatan ${match[1]}` : (value ? 'Lain-lain' : 'Belum ditetapkan');
}
