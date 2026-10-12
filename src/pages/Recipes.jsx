import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Lightbulb, Flame } from 'lucide-react';
import { Recipe } from '@/api/entities';
import { RECIPE_TYPES } from '@/lib/nutrition';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    Recipe.list('order').then(setRecipes);
  }, []);

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-2">
        <Link to="/nutrition" className="p-1.5 -mr-1.5 rounded-full active:bg-muted" aria-label="חזרה">
          <ChevronRight />
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight">המתכונים שלי</h1>
      </header>

      {RECIPE_TYPES.map((type) => {
        const group = recipes.filter((r) => r.type === type);
        if (group.length === 0) return null;
        return (
          <section key={type}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">{type}</h2>
            <div className="space-y-2">
              {group.map((r) => {
                const open = openId === r.id;
                return (
                  <article key={r.id} className="card p-0 overflow-hidden">
                    <button onClick={() => setOpenId(open ? null : r.id)} className="w-full flex items-center gap-3 p-4 text-right">
                      <span className="flex-1">
                        <span className="flex items-center gap-2">
                          <span className="font-bold">{r.name}</span>
                          {r.calories > 0 && (
                            <span className="chip bg-carbs/15 text-carbs py-0.5 px-2 text-xs flex items-center gap-1">
                              <Flame size={12} />
                              {r.calories} קק״ל
                            </span>
                          )}
                        </span>
                        <span className="block text-sm text-muted-foreground mt-0.5">{r.description}</span>
                      </span>
                      <ChevronDown size={20} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && (
                      <div className="px-4 pb-4 space-y-4 animate-[fade_.2s_ease]">
                        <div>
                          <h3 className="font-semibold mb-1.5">רכיבים</h3>
                          <ul className="space-y-1 text-sm">
                            {r.ingredients.map((i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-primary">•</span>
                                {i}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1.5">אופן הכנה</h3>
                          <ol className="space-y-2 text-sm">
                            {r.steps.map((s, idx) => (
                              <li key={idx} className="flex gap-3">
                                <span className="w-6 h-6 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <span className="pt-0.5">{s}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                        {r.tip && (
                          <div className="bg-carbs/10 rounded-xl p-3 text-sm flex gap-2">
                            <Lightbulb size={18} className="text-carbs shrink-0" />
                            <span>{r.tip}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
