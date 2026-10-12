import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Timer, ChevronLeft, UtensilsCrossed, Dumbbell, BookOpen } from 'lucide-react';
import ProgressRing from '@/components/shared/ProgressRing';
import MacroBar from '@/components/shared/MacroBar';
import WeeklySummary from '@/components/shared/WeeklySummary';
import { FoodLog, WorkoutLog } from '@/api/entities';
import { useUserProfile, todayStr } from '@/hooks/useUserProfile';
import { greeting } from '@/lib/date';
import { sumLogs } from '@/lib/nutrition';

export default function Home() {
  const { profile, loading } = useUserProfile();
  const [foodLogs, setFoodLogs] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);

  useEffect(() => {
    const date = todayStr();
    FoodLog.filter({ date }).then(setFoodLogs);
    WorkoutLog.filter({ date }).then(setWorkoutLogs);
  }, []);

  const totals = sumLogs(foodLogs);
  const burned = workoutLogs.reduce((s, l) => s + (l.calories_burned || 0), 0);
  const minutes = workoutLogs.reduce((s, l) => s + (l.duration_minutes || 0), 0);
  const target = profile?.daily_calories || 0;
  const remaining = target - totals.calories + burned;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-muted-foreground text-sm">{new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {greeting()}
          {profile?.name ? `, ${profile.name}` : ''} 👋
        </h1>
      </header>

      {!loading && !profile && (
        <Link to="/profile" className="card flex items-center gap-3 bg-primary text-primary-foreground">
          <span className="text-3xl">🎯</span>
          <span className="flex-1">
            <span className="block font-bold">בוא נגדיר את היעדים שלך</span>
            <span className="block text-sm opacity-90">מלא פרופיל כדי לקבל יעד קלוריות ומאקרו אישי</span>
          </span>
          <ChevronLeft />
        </Link>
      )}

      <section className="card flex flex-col items-center py-6">
        <ProgressRing value={totals.calories} max={target}>
          <span className="text-4xl font-extrabold tabular-nums">{totals.calories}</span>
          <span className="text-sm text-muted-foreground">מתוך {target || '—'} קק״ל</span>
        </ProgressRing>
        <div className="grid grid-cols-3 w-full mt-5 text-center">
          <Stat label="נאכל" value={totals.calories} />
          <Stat label="נשרף" value={burned} />
          <Stat label="נותר" value={target ? remaining : '—'} highlight={target && remaining < 0} />
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="font-bold text-lg">מאקרו יומי</h2>
        <MacroBar label="חלבון" value={totals.protein} target={profile?.daily_protein} color="hsl(var(--protein))" />
        <MacroBar label="פחמימות" value={totals.carbs} target={profile?.daily_carbs} color="hsl(var(--carbs))" />
        <MacroBar label="שומן" value={totals.fat} target={profile?.daily_fat} color="hsl(var(--fat))" />
      </section>

      <section className="card">
        <h2 className="font-bold text-lg mb-3">פעילות היום</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
            <Flame className="text-carbs" />
            <div>
              <div className="font-bold tabular-nums">{burned}</div>
              <div className="text-xs text-muted-foreground">קק״ל נשרפו</div>
            </div>
          </div>
          <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
            <Timer className="text-primary" />
            <div>
              <div className="font-bold tabular-nums">{minutes}</div>
              <div className="text-xs text-muted-foreground">דקות אימון</div>
            </div>
          </div>
        </div>
        {workoutLogs.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm">
            {workoutLogs.map((l) => (
              <li key={l.id} className="flex justify-between">
                <span>
                  {l.emoji} {l.workout_name}
                </span>
                <span className="text-muted-foreground">{l.duration_minutes} דק׳</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <WeeklySummary profile={profile} />

      <section className="grid grid-cols-3 gap-3">
        <QuickLink to="/nutrition" icon={UtensilsCrossed} label="רישום ארוחה" />
        <QuickLink to="/workouts" icon={Dumbbell} label="רישום אימון" />
        <QuickLink to="/recipes" icon={BookOpen} label="מתכונים" />
      </section>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div>
      <div className={`text-xl font-bold tabular-nums ${highlight ? 'text-danger' : ''}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="card flex flex-col items-center gap-2 py-4 active:scale-[0.97] transition">
      <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <Icon size={20} />
      </span>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
