import { useState } from 'react';
import { BarChart3, Share2, Mail, Copy } from 'lucide-react';
import Sheet from '@/components/shared/Sheet';
import { useToast } from '@/components/shared/Toast';
import { buildWeeklySummary } from '@/lib/weeklySummary';

export default function WeeklySummary({ profile }) {
  const toast = useToast();
  const [summary, setSummary] = useState(null);

  const open = async () => setSummary(await buildWeeklySummary(profile));

  const share = async () => {
    try {
      await navigator.share({ title: 'סיכום שבועי FitPulse', text: summary.text });
    } catch (e) {
      if (e.name !== 'AbortError') toast('השיתוף לא נתמך בדפדפן הזה');
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary.text);
      toast('הסיכום הועתק');
    } catch {
      toast('לא ניתן להעתיק');
    }
  };

  const mailto = summary
    ? `mailto:?subject=${encodeURIComponent('סיכום שבועי FitPulse')}&body=${encodeURIComponent(summary.text)}`
    : '#';
  const s = summary?.stats;

  return (
    <>
      <button onClick={open} className="card w-full flex items-center gap-3 active:scale-[0.99] transition">
        <span className="w-10 h-10 rounded-full bg-fat/10 text-fat flex items-center justify-center">
          <BarChart3 size={20} />
        </span>
        <span className="flex-1 text-right">
          <span className="block font-semibold">סיכום שבועי</span>
          <span className="block text-xs text-muted-foreground">7 הימים האחרונים — לשליחה במייל או בוואטסאפ</span>
        </span>
      </button>

      <Sheet open={!!summary} onClose={() => setSummary(null)} title="סיכום שבועי">
        {s && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-center">
              <Tile value={`${s.loggedDays}/7`} label="ימים מתועדים" />
              <Tile value={s.avgCalories} label="ממוצע קק״ל ליום" />
              <Tile value={s.daysOnTarget != null ? `${s.daysOnTarget}/${s.loggedDays}` : '—'} label="ימים ביעד (±10%)" />
              <Tile value={`${s.activeDays}/7`} label="ימים פעילים" />
              <Tile value={s.minutes} label="דקות פעילות" />
              <Tile value={s.burned} label="קק״ל נשרפו" />
            </div>
            <pre className="bg-muted rounded-xl p-3 text-xs whitespace-pre-wrap font-sans leading-relaxed">{summary.text}</pre>
            <div className="grid grid-cols-3 gap-2">
              {typeof navigator.share === 'function' && (
                <button onClick={share} className="btn-primary flex items-center justify-center gap-1.5 text-sm">
                  <Share2 size={16} />
                  שיתוף
                </button>
              )}
              <a href={mailto} className="btn-ghost flex items-center justify-center gap-1.5 text-sm">
                <Mail size={16} />
                מייל
              </a>
              <button onClick={copy} className="btn-ghost flex items-center justify-center gap-1.5 text-sm">
                <Copy size={16} />
                העתקה
              </button>
            </div>
          </div>
        )}
      </Sheet>
    </>
  );
}

function Tile({ value, label }) {
  return (
    <div className="bg-muted rounded-xl py-3">
      <div className="text-lg font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
