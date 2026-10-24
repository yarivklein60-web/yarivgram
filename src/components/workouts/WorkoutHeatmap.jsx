import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { WorkoutLog } from '@/api/entities';
import { shiftDate, todayStr } from '@/lib/date';

// GitHub-style activity grid, modelled on workout.cool's session heatmap.
const WEEKS = 15;
const DAY_LABELS = ['א', '', 'ג', '', 'ה', '', 'ש'];
const LEVELS = ['bg-muted', 'bg-accent/40', 'bg-accent/70', 'bg-accent'];

export default function WorkoutHeatmap({ refreshKey }) {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    WorkoutLog.list().then((rows) => {
      const map = {};
      for (const r of rows) map[r.date] = (map[r.date] || 0) + 1;
      setCounts(map);
    });
  }, [refreshKey]);

  const today = todayStr();
  const [y, m, d] = today.split('-').map(Number);
  const start = shiftDate(today, -(WEEKS - 1) * 7 - new Date(y, m - 1, d).getDay());
  const weeks = Array.from({ length: WEEKS }, (_, w) =>
    Array.from({ length: 7 }, (_, i) => shiftDate(start, w * 7 + i)),
  );

  let streak = 0;
  for (let day = counts[today] ? today : shiftDate(today, -1); counts[day]; day = shiftDate(day, -1)) streak++;
  const total = weeks.flat().reduce((s, day) => s + (counts[day] || 0), 0);

  return (
    <section className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-lg">רצף אימונים</h2>
        <span className="flex items-center gap-1 text-sm font-bold rounded-full px-2.5 py-1 bg-carbs/15 text-carbs">
          <Flame size={14} />
          <span className="tabular-nums">{streak}</span> ימים
        </span>
      </div>
      <div className="flex gap-[3px]">
        <div className="grid grid-rows-7 gap-[3px] text-[9px] text-muted-foreground ml-1">
          {DAY_LABELS.map((l, i) => (
            <span key={i} className="h-3.5 leading-[14px]">{l}</span>
          ))}
        </div>
        {weeks.map((week) => (
          <div key={week[0]} className="grid grid-rows-7 gap-[3px] flex-1">
            {week.map((day) => {
              const c = counts[day] || 0;
              return (
                <span
                  key={day}
                  title={`${day}: ${c} אימונים`}
                  className={`h-3.5 rounded-[3px] ${day > today ? 'opacity-0' : LEVELS[Math.min(c, 3)]} ${day === today ? 'ring-1 ring-primary' : ''}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        <span className="tabular-nums">{total}</span> אימונים ב-{WEEKS} השבועות האחרונים
      </p>
    </section>
  );
}
