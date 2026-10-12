# FitPulse

אפליקציית כושר ותזונה אישית בעברית (RTL), בעיצוב מינימליסטי בסגנון Apple.

**Stack:** React 18 · Vite · Tailwind CSS · React Router · lucide-react

## הרצה

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## מבנה

| נתיב | עמוד |
|---|---|
| `/` | בית — טבעת קלוריות, מאקרו, פעילות יומית, קישורים מהירים |
| `/nutrition` | יומן תזונה — 4 ארוחות, הוספה/מחיקה, ניווט בין ימים |
| `/workouts` | אימונים — סיכום יומי, מאגר לפי קטגוריה, רישום עם הערכת קלוריות |
| `/profile` | פרופיל — חישוב BMR/TDEE ויעדי מאקרו אוטומטי |
| `/recipes` | מתכונים — accordion לפי סוג ארוחה, עם קלוריות למנה |

```
src/
  api/entities.js   שכבת נתונים (UserProfile, Food, FoodLog, Workout, WorkoutLog, Recipe)
  api/seed.js       נתוני פתיחה: ~46 מזונות, 12 אימונים, 10 מתכונים
  lib/nutrition.js  חישובי יעדים, ערכים תזונתיים, קבועים
  hooks/useUserProfile.js
  components/       Layout, ProgressRing, MacroBar, Sheet, DateNav, Toast, AddFoodDialog, WorkoutDialog
  pages/
```

## חישוב יעדים

- BMR (Mifflin–St Jeor) = 10×משקל + 6.25×גובה − 5×גיל (+5 זכר / −161 נקבה)
- TDEE = BMR × מקדם פעילות (1.2–1.9)
- יעד קלוריות = TDEE −500 (ירידה) / +300 (עלייה) / 0
- חלבון = משקל × 1.8 · פחמימות = 45% מהקלוריות ÷ 4 · שומן = 25% ÷ 9

## שכבת הנתונים

`src/api/entities.js` שומר ב-`localStorage` וחושף את אותו API כמו ישויות Base44
(`list(sort)`, `filter(query, sort)`, `get`, `create`, `update`, `delete`).
כדי לעבור ל-Base44 או לכל backend אחר — מחליפים רק את הקובץ הזה.
