export function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatTotal(sec) {
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} דק׳`;
  return `${Math.floor(min / 60)} שע׳ ${min % 60} דק׳`;
}

export function songCount(n) {
  return n === 1 ? 'שיר אחד' : `${n} שירים`;
}

// Stable hue per string so covers keep their color between sessions.
export function hueOf(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  return ((h ^ (h >>> 13)) >>> 0) % 360;
}

// "Artist - Title.mp3" → { artist, title }
export function parseFileName(name) {
  const base = name.replace(/\.[^.]+$/, '').replace(/_/g, ' ').trim();
  const parts = base.split(/\s+-\s+/);
  if (parts.length >= 2) return { artist: parts[0], title: parts.slice(1).join(' - ') };
  return { artist: 'אמן לא ידוע', title: base };
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return 'לילה טוב';
  if (h < 12) return 'בוקר טוב';
  if (h < 17) return 'צהריים טובים';
  if (h < 21) return 'ערב טוב';
  return 'לילה טוב';
}
