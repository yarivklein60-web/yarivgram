import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, shiftDate, todayStr } from '@/lib/date';

export default function DateNav({ date, onChange }) {
  const isToday = date >= todayStr();
  return (
    <div className="flex items-center justify-between card py-2 px-2">
      <button onClick={() => onChange(shiftDate(date, -1))} className="p-2 rounded-full active:bg-muted" aria-label="יום קודם">
        <ChevronRight size={20} />
      </button>
      <span className="font-semibold">{formatDate(date)}</span>
      <button
        onClick={() => onChange(shiftDate(date, 1))}
        disabled={isToday}
        className="p-2 rounded-full active:bg-muted disabled:opacity-30"
        aria-label="יום הבא"
      >
        <ChevronLeft size={20} />
      </button>
    </div>
  );
}
