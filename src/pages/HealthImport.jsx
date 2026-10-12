import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { importHealthDay, parseHealthParams } from '@/lib/healthImport';
import { formatDate } from '@/lib/date';

export default function HealthImport() {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const parsed = parseHealthParams(searchParams);
    if (!parsed) {
      setResult({ error: true });
      return;
    }
    importHealthDay(parsed).then(() => setResult(parsed));
  }, [searchParams]);

  if (!result) return null;

  return (
    <div className="text-center py-16 space-y-4">
      {result.error ? (
        <>
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold">לא התקבלו נתונים</h1>
          <p className="text-muted-foreground text-sm">
            הקישור צריך לכלול <code dir="ltr">burned</code> ו/או <code dir="ltr">minutes</code>.
          </p>
          <Link to="/health-sync" className="btn-primary inline-block">
            להוראות ההגדרה
          </Link>
        </>
      ) : (
        <>
          <div className="text-6xl">⌚</div>
          <h1 className="text-2xl font-bold">הנתונים יובאו</h1>
          <p className="text-muted-foreground">{formatDate(result.date)}</p>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="card">
              <div className="text-2xl font-bold text-carbs tabular-nums">{result.burned}</div>
              <div className="text-xs text-muted-foreground">קק״ל פעילות</div>
            </div>
            <div className="card">
              <div className="text-2xl font-bold text-primary tabular-nums">{result.minutes}</div>
              <div className="text-xs text-muted-foreground">דקות אימון</div>
            </div>
          </div>
          <Link to="/" className="btn-primary inline-block">
            לדף הבית
          </Link>
        </>
      )}
    </div>
  );
}
