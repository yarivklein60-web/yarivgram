export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'לא פעיל', hint: 'עבודה משרדית, ללא אימונים', factor: 1.2 },
  { value: 'light', label: 'קל', hint: '1–3 אימונים בשבוע', factor: 1.375 },
  { value: 'moderate', label: 'בינוני', hint: '3–5 אימונים בשבוע', factor: 1.55 },
  { value: 'active', label: 'פעיל', hint: '6–7 אימונים בשבוע', factor: 1.725 },
  { value: 'athlete', label: 'אתלט', hint: 'אימונים כפולים / עבודה פיזית', factor: 1.9 },
];

export const GOALS = [
  { value: 'lose', label: 'ירידה במשקל', emoji: '📉', adjustment: -500 },
  { value: 'maintain', label: 'שמירה', emoji: '⚖️', adjustment: 0 },
  { value: 'gain', label: 'עלייה במסה', emoji: '💪', adjustment: 300 },
  { value: 'health', label: 'בריאות כללית', emoji: '❤️', adjustment: 0 },
];

export const MEAL_TYPES = [
  { value: 'breakfast', label: 'ארוחת בוקר', emoji: '🌅' },
  { value: 'lunch', label: 'ארוחת צהריים', emoji: '☀️' },
  { value: 'dinner', label: 'ארוחת ערב', emoji: '🌙' },
  { value: 'snack', label: 'ביניים', emoji: '🍏' },
];

export const FOOD_CATEGORIES = ['פירות', 'ירקות', 'חלבונים', 'פחמימות', 'שומנים', 'משקאות', 'חטיפים', 'מנות עיקריות'];
export const WORKOUT_CATEGORIES = ['כוח', 'קרדיו', 'גמישויות', 'אירובי', 'פונקציונלי'];
export const RECIPE_TYPES = ['בוקר', 'צהריים או ערב', 'סגנון אסייתי', 'ארוחת עצלן'];

// Mifflin–St Jeor BMR → TDEE → goal-adjusted daily targets.
export function calculateTargets({ weight, height, age, gender, activity_level, goal }) {
  const w = Number(weight);
  const h = Number(height);
  const a = Number(age);
  if (!w || !h || !a) return null;

  const bmr = 10 * w + 6.25 * h - 5 * a + (gender === 'female' ? -161 : 5);
  const factor = ACTIVITY_LEVELS.find((l) => l.value === activity_level)?.factor ?? 1.2;
  const tdee = bmr * factor;
  const adjustment = GOALS.find((g) => g.value === goal)?.adjustment ?? 0;
  const calories = Math.round(tdee + adjustment);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    daily_calories: calories,
    daily_protein: Math.round(w * 1.8),
    daily_carbs: Math.round((calories * 0.45) / 4),
    daily_fat: Math.round((calories * 0.25) / 9),
  };
}

export function nutritionFor(food, grams) {
  const ratio = (Number(grams) || 0) / 100;
  const r1 = (n) => Math.round((n || 0) * ratio * 10) / 10;
  return {
    calories: Math.round((food.calories_per_100g || 0) * ratio),
    protein: r1(food.protein_per_100g),
    carbs: r1(food.carbs_per_100g),
    fat: r1(food.fat_per_100g),
  };
}

export function sumLogs(logs) {
  return logs.reduce(
    (acc, l) => ({
      calories: acc.calories + (l.calories || 0),
      protein: acc.protein + (l.protein || 0),
      carbs: acc.carbs + (l.carbs || 0),
      fat: acc.fat + (l.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}
