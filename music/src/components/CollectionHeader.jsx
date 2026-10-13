import { formatTotal, songCount } from '@/lib/format';

// Big gradient header shared by playlist, liked songs and library pages.
export default function CollectionHeader({ cover, label, title, tracks, hue = 150, onTitleClick, children }) {
  const total = tracks.reduce((s, t) => s + (t.duration || 0), 0);
  return (
    <header
      className="flex flex-col items-center gap-5 px-4 pb-6 pt-10 text-center md:flex-row md:items-end md:gap-6 md:px-6 md:text-right"
      style={{ background: `linear-gradient(to bottom, hsl(${hue} 45% 34%), hsl(${hue} 30% 16%))` }}
    >
      <div className="shadow-2xl shadow-black/50">{cover}</div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        {onTitleClick ? (
          <button type="button" onClick={onTitleClick} title="שינוי שם" className="block max-w-full text-right">
            <h1 className="mt-1 truncate text-4xl font-extrabold tracking-tight md:text-6xl">{title}</h1>
          </button>
        ) : (
          <h1 className="mt-1 truncate text-4xl font-extrabold tracking-tight md:text-6xl">{title}</h1>
        )}
        {children}
        <div className="mt-3 text-sm text-white/80">
          {songCount(tracks.length)}
          {tracks.length > 0 && <span className="text-white/60">, {formatTotal(total)}</span>}
        </div>
      </div>
    </header>
  );
}
