import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, BookOpen, ChevronLeft } from 'lucide-react';
import DateNav from '@/components/shared/DateNav';
import AddFoodDialog from '@/components/nutrition/AddFoodDialog';
import { useToast } from '@/components/shared/Toast';
import { FoodLog } from '@/api/entities';
import { useUserProfile, todayStr } from '@/hooks/useUserProfile';
import { MEAL_TYPES, sumLogs } from '@/lib/nutrition';

export default function Nutrition() {
  const { profile } = useUserProfile();
  const toast = useToast();
  const [date, setDate] = useState(todayStr());
  const [logs, setLogs] = useState([]);
  const [addingTo, setAddingTo] = useState(null);

  const load = useCallback(() => FoodLog.filter({ date }, 'created_date').then(setLogs), [date]);
  useEffect(() => {
    load();
  }, [load]);

  const totals = sumLogs(logs);
  const target = profile?.daily_calories || 0;
  const pct = target ? Math.min((totals.calories / target) * 100, 100) : 0;

  const remove = async (log) => {
    await FoodLog.delete(log.id);
    toast(`${log.food_name} הוסר`);
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">תזונה</h1>
      <DateNav date={date} onChange={setDate} />

      <section className="card">
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-3xl font-extrabold tabular-nums">{totals.calories}</span>
            <span className="text-muted-foreground"> / {target || '—'} קק״ל</span>
          </div>
          {target > 0 && (
            <span className={`text-sm font-medium ${totals.calories > target ? 'text-danger' : 'text-muted-foreground'}`}>
              {totals.calories > target ? `חריגה של ${totals.calories - target}` : `נותרו ${target - totals.calories}`}
            </span>
          )}
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${totals.calories > target && target ? 'bg-danger' : 'bg-primary'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="grid grid-cols-3 text-center mt-4 text-sm">
          <Macro label="חלבון" value={totals.protein} cls="text-protein" />
          <Macro label="פחמימות" value={totals.carbs} cls="text-carbs" />
          <Macro label="שומן" value={totals.fat} cls="text-fat" />
        </div>
      </section>

      <Link to="/recipes" className="card flex items-center gap-3 active:scale-[0.99] transition">
        <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <BookOpen size={20} />
        </span>
        <span className="flex-1 font-semibold">המתכונים שלי</span>
        <ChevronLeft className="text-muted-foreground" />
      </Link>

      {MEAL_TYPES.map((meal) => {
        const items = logs.filter((l) => l.meal_type === meal.value);
        const mealCalories = items.reduce((s, l) => s + l.calories, 0);
        return (
          <section key={meal.value} className="card">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">
                {meal.emoji} {meal.label}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground tabular-nums">{mealCalories} קק״ל</span>
                <button
                  onClick={() => setAddingTo(meal.value)}
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                  aria-label={`הוספה ל${meal.label}`}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
            {items.length > 0 && (
              <ul className="mt-2 divide-y divide-border">
                {items.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 py-2.5">
                    <span className="text-xl">{l.emoji}</span>
                    <span className="flex-1">
                      <span className="block font-medium text-sm">{l.food_name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {l.quantity_grams} ג׳ · ח {l.protein} · פ {l.carbs} · ש {l.fat}
                      </span>
                    </span>
                    <span className="text-sm tabular-nums">{l.calories}</span>
                    <button onClick={() => remove(l)} className="p-1.5 text-muted-foreground active:text-danger" aria-label="מחיקה">
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <AddFoodDialog
        open={!!addingTo}
        mealType={addingTo}
        date={date}
        onClose={() => setAddingTo(null)}
        onAdded={(name) => {
          toast(`${name} נוסף`);
          load();
        }}
      />
    </div>
  );
}

function Macro({ label, value, cls }) {
  return (
    <div>
      <div className={`font-bold tabular-nums ${cls}`}>{Math.round(value)} ג׳</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
