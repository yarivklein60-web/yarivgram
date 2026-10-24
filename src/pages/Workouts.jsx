import { useCallback, useEffect, useState } from 'react';
import { Flame, Timer, Trash2, CheckCircle2 } from 'lucide-react';
import DateNav from '@/components/shared/DateNav';
import WorkoutDialog from '@/components/workouts/WorkoutDialog';
import WorkoutHeatmap from '@/components/workouts/WorkoutHeatmap';
import { useToast } from '@/components/shared/Toast';
import { Workout, WorkoutLog } from '@/api/entities';
import { todayStr } from '@/hooks/useUserProfile';
import { WORKOUT_CATEGORIES } from '@/lib/nutrition';

export default function Workouts() {
  const toast = useToast();
  const [date, setDate] = useState(todayStr());
  const [workouts, setWorkouts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [category, setCategory] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Workout.list('name').then(setWorkouts);
  }, []);

  const load = useCallback(() => WorkoutLog.filter({ date }, 'created_date').then(setLogs), [date]);
  useEffect(() => {
    load();
  }, [load]);

  const burned = logs.reduce((s, l) => s + (l.calories_burned || 0), 0);
  const minutes = logs.reduce((s, l) => s + (l.duration_minutes || 0), 0);
  const visible = category ? workouts.filter((w) => w.category === category) : workouts;

  const remove = async (log) => {
    await WorkoutLog.delete(log.id);
    toast(`${log.workout_name} הוסר`);
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">אימונים</h1>
      <DateNav date={date} onChange={setDate} />

      <section className="grid grid-cols-3 gap-3">
        <Summary icon={CheckCircle2} cls="text-primary" value={logs.length} label="אימונים" />
        <Summary icon={Timer} cls="text-fat" value={minutes} label="דקות" />
        <Summary icon={Flame} cls="text-carbs" value={burned} label="קק״ל" />
      </section>

      <WorkoutHeatmap refreshKey={logs} />

      {logs.length > 0 && (
        <section className="card">
          <h2 className="font-bold mb-1">בוצעו</h2>
          <ul className="divide-y divide-border">
            {logs.map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-2.5">
                <span className="text-xl">{l.emoji}</span>
                <span className="flex-1">
                  <span className="block font-medium text-sm">{l.workout_name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {l.duration_minutes} דק׳ · {l.calories_burned} קק״ל
                  </span>
                </span>
                <button onClick={() => remove(l)} className="p-1.5 text-muted-foreground active:text-danger" aria-label="מחיקה">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 no-scrollbar">
        <button onClick={() => setCategory(null)} className={`chip ${!category ? 'chip-active' : 'bg-card'}`}>
          הכל
        </button>
        {WORKOUT_CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`chip ${category === c ? 'chip-active' : 'bg-card'}`}>
            {c}
          </button>
        ))}
      </div>

      <section className="grid grid-cols-2 gap-3">
        {visible.map((w) => (
          <button key={w.id} onClick={() => setSelected(w)} className="card text-right active:scale-[0.97] transition">
            <div className="text-3xl mb-2">{w.emoji}</div>
            <div className="font-semibold leading-tight">{w.name}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {w.duration_minutes} דק׳ · {w.calories_burned} קק״ל
            </div>
            <div className="text-[11px] mt-2 inline-block chip bg-muted py-0.5 px-2">{w.difficulty}</div>
          </button>
        ))}
      </section>

      <WorkoutDialog
        workout={selected}
        date={date}
        onClose={() => setSelected(null)}
        onLogged={(name) => {
          toast(`${name} נרשם 💪`);
          load();
        }}
      />
    </div>
  );
}

function Summary({ icon: Icon, cls, value, label }) {
  return (
    <div className="card flex flex-col items-center py-3">
      <Icon className={cls} size={20} />
      <div className="text-xl font-bold tabular-nums mt-1">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
