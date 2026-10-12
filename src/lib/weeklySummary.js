import { FoodLog, WorkoutLog } from '@/api/entities';
import { shiftDate, todayStr } from '@/lib/date';
import { sumLogs } from '@/lib/nutrition';

// Last 7 days including today.
export async function buildWeeklySummary(profile) {
  const end = todayStr();
  const start = shiftDate(end, -6);
  const inRange = (l) => l.date >= start && l.date <= end;
  const [foodLogs, workoutLogs] = await Promise.all([FoodLog.list(), WorkoutLog.list()]);
  const food = foodLogs.filter(inRange);
  const workouts = workoutLogs.filter(inRange);

  const days = [...new Set(food.map((l) => l.date))];
  const loggedDays = days.length;
  const totals = sumLogs(food);
  const avg = (n) => (loggedDays ? Math.round(n / loggedDays) : 0);
  const target = profile?.daily_calories || 0;
  const daysOnTarget = target
    ? days.filter((d) => {
        const kcal = sumLogs(food.filter((l) => l.date === d)).calories;
        return Math.abs(kcal - target) <= target * 0.1;
      }).length
    : null;

  const manualWorkouts = workouts.filter((w) => w.source !== 'apple_health');
  const stats = {
    start,
    end,
    loggedDays,
    avgCalories: avg(totals.calories),
    avgProtein: avg(totals.protein),
    avgCarbs: avg(totals.carbs),
    avgFat: avg(totals.fat),
    daysOnTarget,
    workoutCount: manualWorkouts.length,
    activeDays: new Set(workouts.map((w) => w.date)).size,
    burned: workouts.reduce((s, w) => s + (w.calories_burned || 0), 0),
    minutes: workouts.reduce((s, w) => s + (w.duration_minutes || 0), 0),
  };
  return { stats, text: summaryText(stats, profile) };
}

function fmt(dateStr) {
  const [, m, d] = dateStr.split('-');
  return `${Number(d)}.${Number(m)}`;
}

function summaryText(s, profile) {
  const lines = [
    `📊 סיכום שבועי FitPulse — ${fmt(s.start)}–${fmt(s.end)}`,
    '',
    '🍽️ תזונה',
    `• ימים מתועדים: ${s.loggedDays}/7`,
    `• ממוצע יומי: ${s.avgCalories} קק״ל${profile?.daily_calories ? ` (יעד ${profile.daily_calories})` : ''}`,
    `• חלבון ${s.avgProtein} ג׳ · פחמימות ${s.avgCarbs} ג׳ · שומן ${s.avgFat} ג׳`,
  ];
  if (s.daysOnTarget != null) lines.push(`• ימים ביעד (±10%): ${s.daysOnTarget}/${s.loggedDays}`);
  lines.push(
    '',
    '🏃 פעילות',
    `• ימים פעילים: ${s.activeDays}/7`,
    `• אימונים שנרשמו: ${s.workoutCount}`,
    `• ${s.minutes} דקות · ${s.burned} קק״ל נשרפו`,
  );
  return lines.join('\n');
}
