import { useEffect, useMemo, useState } from 'react';
import { UserProfile } from '@/api/entities';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/components/shared/Toast';
import { ACTIVITY_LEVELS, GOALS, calculateTargets } from '@/lib/nutrition';

const EMPTY = { name: '', age: '', gender: 'male', height: '', weight: '', activity_level: 'moderate', goal: 'maintain' };

export default function Profile() {
  const { profile, loading, reload } = useUserProfile();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({ ...EMPTY, ...profile });
  }, [profile]);

  const targets = useMemo(() => calculateTargets(form), [form]);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target?.value ?? e }));

  const save = async () => {
    setSaving(true);
    const data = {
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      height: Number(form.height),
      weight: Number(form.weight),
      activity_level: form.activity_level,
      goal: form.goal,
      daily_calories: targets.daily_calories,
      daily_protein: targets.daily_protein,
      daily_carbs: targets.daily_carbs,
      daily_fat: targets.daily_fat,
    };
    if (profile) await UserProfile.update(profile.id, data);
    else await UserProfile.create(data);
    await reload();
    setSaving(false);
    toast('הפרופיל נשמר ✓');
  };

  if (loading) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">פרופיל</h1>

      <section className="card space-y-3">
        <h2 className="font-bold">פרטים אישיים</h2>
        <div>
          <label className="label">שם</label>
          <input className="input" value={form.name} onChange={set('name')} placeholder="איך לקרוא לך?" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">גיל</label>
            <input className="input tabular-nums" type="number" inputMode="numeric" value={form.age} onChange={set('age')} />
          </div>
          <div>
            <label className="label">מין</label>
            <div className="grid grid-cols-2 bg-muted rounded-xl p-1">
              {[
                ['male', 'זכר'],
                ['female', 'נקבה'],
              ].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setForm((f) => ({ ...f, gender: v }))}
                  className={`rounded-lg py-2 text-sm font-medium transition ${form.gender === v ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">גובה (ס״מ)</label>
            <input className="input tabular-nums" type="number" inputMode="numeric" value={form.height} onChange={set('height')} />
          </div>
          <div>
            <label className="label">משקל (ק״ג)</label>
            <input className="input tabular-nums" type="number" inputMode="decimal" value={form.weight} onChange={set('weight')} />
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="font-bold mb-2">רמת פעילות</h2>
        <div className="space-y-2">
          {ACTIVITY_LEVELS.map((l) => (
            <button
              key={l.value}
              onClick={() => setForm((f) => ({ ...f, activity_level: l.value }))}
              className={`w-full text-right rounded-xl px-4 py-3 border-2 transition ${
                form.activity_level === l.value ? 'border-primary bg-primary/5' : 'border-transparent bg-muted'
              }`}
            >
              <span className="font-semibold">{l.label}</span>
              <span className="text-sm text-muted-foreground"> · {l.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="font-bold mb-2">מטרה</h2>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map((g) => (
            <button
              key={g.value}
              onClick={() => setForm((f) => ({ ...f, goal: g.value }))}
              className={`rounded-xl py-4 border-2 transition ${form.goal === g.value ? 'border-primary bg-primary/5' : 'border-transparent bg-muted'}`}
            >
              <div className="text-2xl">{g.emoji}</div>
              <div className="text-sm font-semibold mt-1">{g.label}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="font-bold mb-3">יעדים יומיים</h2>
        {targets ? (
          <>
            <div className="text-center mb-4">
              <div className="text-4xl font-extrabold text-primary tabular-nums">{targets.daily_calories}</div>
              <div className="text-sm text-muted-foreground">קלוריות ליום</div>
              <div className="text-xs text-muted-foreground mt-1">
                BMR {targets.bmr} · TDEE {targets.tdee}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Target label="חלבון" value={targets.daily_protein} cls="text-protein" />
              <Target label="פחמימות" value={targets.daily_carbs} cls="text-carbs" />
              <Target label="שומן" value={targets.daily_fat} cls="text-fat" />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">מלא גיל, גובה ומשקל כדי לחשב יעדים</p>
        )}
      </section>

      <button className="btn-primary w-full" disabled={!targets || saving} onClick={save}>
        שמירת פרופיל
      </button>
    </div>
  );
}

function Target({ label, value, cls }) {
  return (
    <div className="bg-muted rounded-xl py-3">
      <div className={`text-lg font-bold tabular-nums ${cls}`}>{value} ג׳</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
