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
| `/health-sync` | הוראות חיבור Apple Watch דרך קיצור דרך של iOS |
| `/import?burned=…&minutes=…` | קליטת נתוני Apple Health מקיצור הדרך |

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

## Apple Watch / Apple Health

אפליקציית ווב לא יכולה לגשת ל-HealthKit, לכן קיצור דרך ב-iOS קורא את Active Energy ו-Exercise Minutes של היום
ופותח את `/import?burned=…&minutes=…` (אפשר גם `&date=YYYY-MM-DD`). כל ייבוא מחליף את רשומת Apple Watch של
אותו יום, כך שהרצה חוזרת לא יוצרת כפילויות. הוראות מלאות בעמוד `/health-sync`.

## סיכום שבועי

כרטיס בדף הבית שמסכם את 7 הימים האחרונים (ממוצעי קלוריות ומאקרו, ימים ביעד, פעילות) ומאפשר שיתוף, שליחה במייל או העתקה.
שליחה אוטומטית תדרוש שרת (למשל Supabase + Resend), כי הנתונים כרגע נשמרים רק בדפדפן.

## פריסה

האפליקציה מתפרסמת אוטומטית ל-GitHub Pages בכל push ל-`main`
(`.github/workflows/deploy.yml`), בכתובת https://yarivklein60-web.github.io/yarivgram/

הגדרה חד-פעמית: Settings → Pages → Source: **GitHub Actions**.

ה-workflow בונה עם `BASE_PATH=/yarivgram/` ומעתיק את `index.html` ל-`404.html`, כך שגם נתיבים פנימיים
(כמו `/import` מקיצור הדרך) נטענים. בפריסה לשורש דומיין (Netlify/Vercel) אין צורך ב-`BASE_PATH`,
אבל יש להגדיר הפניה של כל הנתיבים ל-`index.html`.
