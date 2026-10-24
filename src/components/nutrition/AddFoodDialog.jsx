import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import Sheet from '@/components/shared/Sheet';
import { Food, FoodLog } from '@/api/entities';
import { FOOD_CATEGORIES, MEAL_TYPES, nutritionFor } from '@/lib/nutrition';

export default function AddFoodDialog({ open, onClose, mealType, date, onAdded }) {
  const [foods, setFoods] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [selected, setSelected] = useState(null);
  const [grams, setGrams] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    Food.list('name').then(setFoods);
    setQuery('');
    setCategory(null);
    setSelected(null);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim();
    return foods.filter((f) => (!category || f.category === category) && (!q || f.name.includes(q)));
  }, [foods, query, category]);

  const values = selected ? nutritionFor(selected, grams) : null;
  const meal = MEAL_TYPES.find((m) => m.value === mealType);

  const pick = (food) => {
    setSelected(food);
    setGrams(String(food.serving_size || 100));
  };

  const save = async () => {
    setSaving(true);
    await FoodLog.create({
      food_name: selected.name,
      food_id: selected.id,
      emoji: selected.emoji,
      date,
      meal_type: mealType,
      quantity_grams: Number(grams),
      ...values,
    });
    setSaving(false);
    onAdded?.(selected.name);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={selected ? selected.name : `הוספה ל${meal?.label ?? ''}`}>
      {!selected ? (
        <>
          <div className="relative mb-3">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input className="input pr-10" placeholder="חיפוש מזון..." value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-5 px-5 no-scrollbar">
            <button onClick={() => setCategory(null)} className={`chip ${!category ? 'chip-active' : 'bg-muted'}`}>
              הכל
            </button>
            {FOOD_CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={`chip ${category === c ? 'chip-active' : 'bg-muted'}`}>
                {c}
              </button>
            ))}
          </div>
          <ul className="divide-y divide-border">
            {filtered.map((f) => (
              <li key={f.id}>
                <button onClick={() => pick(f)} className="w-full flex items-center gap-3 py-3 text-right">
                  <span className="text-2xl w-9 text-center">{f.emoji}</span>
                  <span className="flex-1">
                    <span className="block font-medium">{f.name}</span>
                    <span className="block text-xs text-muted-foreground">{f.calories_per_100g} קק״ל ל-100 ג׳</span>
                  </span>
                  <ChevronRight size={18} className="text-muted-foreground rotate-180" />
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="py-8 text-center text-muted-foreground">לא נמצאו מזונות</li>}
          </ul>
        </>
      ) : (
        <div className="space-y-5">
          <div className="text-center text-6xl pt-2">{selected.emoji}</div>
          <div>
            <label className="label">כמות (גרם)</label>
            <input className="input text-lg tabular-nums" type="number" inputMode="numeric" min="1" value={grams} onChange={(e) => setGrams(e.target.value)} />
            <div className="flex gap-2 mt-2">
              {[50, 100, 150, 200].map((g) => (
                <button key={g} onClick={() => setGrams(String(g))} className="chip bg-muted flex-1">
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              ['קלוריות', values.calories, 'text-primary'],
              ['חלבון', values.protein, 'text-protein'],
              ['פחמימות', values.carbs, 'text-carbs'],
              ['שומן', values.fat, 'text-fat'],
            ].map(([label, v, cls]) => (
              <div key={label} className="bg-muted rounded-xl py-3">
                <div className={`text-lg font-bold tabular-nums ${cls}`}>{v}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => setSelected(null)}>
              חזרה
            </button>
            <button className="btn-primary flex-[2]" disabled={!Number(grams) || saving} onClick={save}>
              הוספה
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
