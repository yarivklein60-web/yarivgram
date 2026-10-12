import { Link } from 'react-router-dom';
import { ChevronRight, Copy } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';

const STEPS = [
  {
    title: 'יוצרים קיצור דרך חדש',
    body: 'באפליקציית "קיצורים" (Shortcuts) לוחצים על + ליצירת קיצור חדש.',
  },
  {
    title: 'קלוריות פעילות',
    body: 'מוסיפים פעולה "Find Health Samples" ← סוג: Active Energy, תאריך התחלה: Today. אחריה פעולה "Calculate Statistics" ← Sum.',
  },
  {
    title: 'דקות אימון',
    body: 'שוב "Find Health Samples" ← סוג: Exercise Minutes (זמן אימון), תאריך התחלה: Today. אחריה "Calculate Statistics" ← Sum.',
  },
  {
    title: 'בונים את הקישור',
    body: 'מוסיפים פעולה "URL" ומדביקים את הקישור למטה. במקום המילים BURNED ו-MINUTES מכניסים את שתי תוצאות "Calculate Statistics" (לחיצה ארוכה ← Select Variable).',
  },
  {
    title: 'פותחים את הקישור',
    body: 'מוסיפים פעולה "Open URLs". שומרים את הקיצור בשם "סנכרון FitPulse".',
  },
  {
    title: 'אוטומציה יומית (אופציונלי)',
    body: 'בלשונית "אוטומציה" יוצרים אוטומציה לפי שעה (למשל 21:00) שמריצה את הקיצור. iOS עשוי לבקש אישור לפתיחת הקישור.',
  },
];

export default function HealthSync() {
  const toast = useToast();
  const template = `${window.location.origin}/import?burned=BURNED&minutes=MINUTES`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(template);
      toast('הקישור הועתק');
    } catch {
      toast('לא ניתן להעתיק — סמן והעתק ידנית');
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-2">
        <Link to="/profile" className="p-1.5 -mr-1.5 rounded-full active:bg-muted" aria-label="חזרה">
          <ChevronRight />
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight">חיבור Apple Watch</h1>
      </header>

      <section className="card text-sm leading-relaxed">
        <p>
          אפליקציית ווב לא יכולה לקרוא ישירות מ-Apple Health. במקום זה, קיצור דרך באייפון קורא את נתוני היום ושולח אותם ל-FitPulse.
        </p>
        <p className="mt-2 text-muted-foreground">
          כל הרצה מעדכנת את רשומת Apple Watch של אותו יום (לא מוסיפה כפילות). הקלוריות כוללות את כל הפעילות של היום, לכן אין צורך לרשום ידנית
          אימונים שהשעון כבר מדד.
        </p>
      </section>

      <section className="card">
        <h2 className="font-bold mb-2">הקישור לקיצור הדרך</h2>
        <div dir="ltr" className="bg-muted rounded-xl p-3 text-xs break-all font-mono">
          {template}
        </div>
        <button onClick={copy} className="btn-ghost w-full mt-3 flex items-center justify-center gap-2">
          <Copy size={16} />
          העתקה
        </button>
      </section>

      <section className="card">
        <h2 className="font-bold mb-3">הגדרה חד-פעמית</h2>
        <ol className="space-y-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span className="w-7 h-7 shrink-0 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">{i + 1}</span>
              <div>
                <div className="font-semibold">{s.title}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{s.body}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <p className="text-xs text-muted-foreground text-center px-4">
        הקיצור פותח את הקישור בספארי, והנתונים נשמרים שם. השתמש ב-FitPulse דרך ספארי באותו אייפון — אפליקציה שנוספה למסך הבית שומרת נתונים בנפרד מספארי ולא תראה את הייבוא.
      </p>
    </div>
  );
}
