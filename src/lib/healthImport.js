import { WorkoutLog } from '@/api/entities';
import { todayStr } from '@/lib/date';

export const HEALTH_SOURCE = 'apple_health';
export const HEALTH_LOG_NAME = 'Apple Watch — פעילות יומית';

function parseAmount(raw, max) {
  if (raw == null || raw === '') return null;
  // Shortcuts may format numbers with thousands separators or a decimal comma.
  const n = Number(String(raw).replace(/[^\d.,]/g, '').replace(/,(?=\d{3}\b)/g, '').replace(',', '.'));
  if (!Number.isFinite(n) || n < 0 || n > max) return null;
  return Math.round(n);
}

export function parseHealthParams(searchParams) {
  const burned = parseAmount(searchParams.get('burned'), 10000);
  const minutes = parseAmount(searchParams.get('minutes'), 1440);
  const dateParam = searchParams.get('date');
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateParam ?? '') && dateParam <= todayStr() ? dateParam : todayStr();
  if (burned == null && minutes == null) return null;
  return { burned: burned ?? 0, minutes: minutes ?? 0, date };
}

// Health totals are cumulative for the day, so each import replaces that
// day's Apple Health entry instead of adding another one.
export async function importHealthDay({ burned, minutes, date }) {
  const data = {
    workout_name: HEALTH_LOG_NAME,
    emoji: '⌚',
    date,
    duration_minutes: minutes,
    calories_burned: burned,
    completed: true,
    source: HEALTH_SOURCE,
  };
  const [existing] = await WorkoutLog.filter({ date, source: HEALTH_SOURCE });
  return existing ? WorkoutLog.update(existing.id, data) : WorkoutLog.create(data);
}
