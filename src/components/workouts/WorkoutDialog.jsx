import { useEffect, useState } from 'react';
import Sheet from '@/components/shared/Sheet';
import { WorkoutLog } from '@/api/entities';

export default function WorkoutDialog({ workout, date, onClose, onLogged }) {
  const [duration, setDuration] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (workout) setDuration(String(workout.duration_minutes));
  }, [workout]);

  if (!workout) return null;
  const perMinute = workout.calories_burned / workout.duration_minutes;
  const estimate = Math.round(perMinute * (Number(duration) || 0));

  const save = async () => {
    setSaving(true);
    await WorkoutLog.create({
      workout_name: workout.name,
      workout_id: workout.id,
      emoji: workout.emoji,
      date,
      duration_minutes: Number(duration),
      calories_burned: estimate,
      completed: true,
    });
    setSaving(false);
    onLogged?.(workout.name);
    onClose();
  };

  return (
    <Sheet open onClose={onClose} title={workout.name}>
      <div className="space-y-5">
        <div className="text-center">
          <div className="text-6xl mb-2">{workout.emoji}</div>
          <p className="text-muted-foreground text-sm">{workout.description}</p>
          <div className="flex justify-center gap-2 mt-3">
            <span className="chip bg-muted">{workout.category}</span>
            <span className="chip bg-muted">{workout.difficulty}</span>
          </div>
        </div>
        <div>
          <label className="label">משך בפועל (דקות)</label>
          <input className="input text-lg tabular-nums" type="number" inputMode="numeric" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} />
          <div className="flex gap-2 mt-2">
            {[15, 30, 45, 60].map((m) => (
              <button key={m} onClick={() => setDuration(String(m))} className="chip bg-muted flex-1">
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-muted rounded-2xl py-4 text-center">
          <div className="text-3xl font-bold text-primary tabular-nums">{estimate}</div>
          <div className="text-sm text-muted-foreground">קלוריות שנשרפו (הערכה)</div>
        </div>
        <button className="btn-primary w-full" disabled={!Number(duration) || saving} onClick={save}>
          רישום אימון
        </button>
      </div>
    </Sheet>
  );
}
