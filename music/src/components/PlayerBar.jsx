import { useState } from 'react';
import { ChevronDown, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume1, Volume2, VolumeX } from 'lucide-react';
import Cover from './Cover';
import LikeButton from './LikeButton';
import Range from './Range';
import { usePlayer } from '@/lib/player';
import { formatTime } from '@/lib/format';

function Controls({ big = false }) {
  const p = usePlayer();
  const RepeatIcon = p.repeat === 'one' ? Repeat1 : Repeat;
  const toggleCls = (on) => `relative transition ${on ? 'text-accent' : 'text-subtle hover:text-white'}`;
  const dot = <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />;
  const icon = big ? 'h-7 w-7' : 'h-5 w-5';
  return (
    <div dir="ltr" className={`flex items-center justify-center ${big ? 'gap-8' : 'gap-5'}`}>
      <button type="button" onClick={p.toggleShuffle} aria-label="ערבוב" aria-pressed={p.shuffle} className={toggleCls(p.shuffle)}>
        <Shuffle className={big ? 'h-6 w-6' : 'h-4 w-4'} />
        {p.shuffle && dot}
      </button>
      <button type="button" onClick={p.prev} aria-label="הקודם" className="text-subtle transition hover:text-white">
        <SkipBack className={`${icon} fill-current`} />
      </button>
      <button
        type="button"
        onClick={p.toggle}
        aria-label={p.isPlaying ? 'השהה' : 'נגן'}
        className={`flex items-center justify-center rounded-full bg-white text-black transition hover:scale-105 active:scale-95 ${big ? 'h-16 w-16' : 'h-8 w-8'}`}
      >
        {p.isPlaying ? <Pause className={`${big ? 'h-7 w-7' : 'h-4 w-4'} fill-black`} /> : <Play className={`${big ? 'h-7 w-7' : 'h-4 w-4'} translate-x-[1px] fill-black`} />}
      </button>
      <button type="button" onClick={p.next} aria-label="הבא" className="text-subtle transition hover:text-white">
        <SkipForward className={`${icon} fill-current`} />
      </button>
      <button
        type="button"
        onClick={p.cycleRepeat}
        aria-label={p.repeat === 'one' ? 'חזרה על השיר' : p.repeat === 'all' ? 'חזרה על הרשימה' : 'חזרה כבויה'}
        className={toggleCls(p.repeat !== 'off')}
      >
        <RepeatIcon className={big ? 'h-6 w-6' : 'h-4 w-4'} />
        {p.repeat !== 'off' && dot}
      </button>
    </div>
  );
}

function Progress() {
  const p = usePlayer();
  return (
    <div dir="ltr" className="flex w-full items-center gap-2 text-[11px] tabular-nums text-subtle">
      <span className="w-10 text-right">{formatTime(p.time)}</span>
      <Range label="מיקום בשיר" value={p.time} max={p.duration} onChange={p.seek} className="flex-1" />
      <span className="w-10">{formatTime(p.duration)}</span>
    </div>
  );
}

function NowPlaying({ onClose }) {
  const p = usePlayer();
  const t = p.current;
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-gradient-to-b from-elevated to-base px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] md:hidden">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onClose} aria-label="סגירה" className="-mr-2 p-2">
          <ChevronDown className="h-7 w-7" />
        </button>
        <span className="text-xs font-semibold uppercase tracking-wider text-subtle">מתנגן עכשיו</span>
        <span className="w-11" />
      </div>
      <div className="flex flex-1 items-center justify-center py-6">
        <Cover seed={t.id} className="aspect-square w-full max-w-sm shadow-2xl shadow-black/60" rounded="rounded-xl" />
      </div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate text-2xl font-bold">{t.title}</div>
          <div className="truncate text-subtle">{t.artist}</div>
        </div>
        <LikeButton track={t} className="[&_svg]:h-6 [&_svg]:w-6" />
      </div>
      <Progress />
      <div className="mt-6">
        <Controls big />
      </div>
    </div>
  );
}

export default function PlayerBar() {
  const p = usePlayer();
  const [expanded, setExpanded] = useState(false);
  const t = p.current;
  const VolIcon = p.muted || p.volume === 0 ? VolumeX : p.volume < 0.5 ? Volume1 : Volume2;

  return (
    <>
      {/* Desktop */}
      <footer className="hidden h-[5.5rem] shrink-0 grid-cols-[1fr_minmax(0,40rem)_1fr] items-center gap-4 px-4 md:grid">
        <div className="flex min-w-0 items-center gap-3">
          {t ? (
            <>
              <Cover seed={t.id} className="h-14 w-14" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{t.title}</div>
                <div className="truncate text-xs text-subtle">{t.artist}</div>
              </div>
              <LikeButton track={t} className="mr-2" />
            </>
          ) : (
            <span className="text-sm text-subtle">בחר שיר כדי להתחיל</span>
          )}
        </div>

        <div className={`flex flex-col items-center gap-1.5 ${t ? '' : 'pointer-events-none opacity-40'}`}>
          <Controls />
          <Progress />
        </div>

        <div dir="ltr" className="flex items-center justify-end gap-2">
          <button type="button" onClick={p.toggleMute} aria-label={p.muted ? 'ביטול השתקה' : 'השתקה'} className="text-subtle transition hover:text-white">
            <VolIcon className="h-5 w-5" />
          </button>
          <Range label="עוצמת שמע" value={p.muted ? 0 : p.volume} max={1} onChange={p.setVolume} className="w-28" />
        </div>
      </footer>

      {/* Mobile mini player */}
      {t && (
        <div className="px-2 pt-2 md:hidden">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setExpanded(true)}
            onKeyDown={(e) => e.key === 'Enter' && setExpanded(true)}
            className="relative flex items-center gap-3 overflow-hidden rounded-lg bg-elevated p-2"
          >
            <Cover seed={t.id} className="h-10 w-10" rounded="rounded" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{t.title}</div>
              <div className="truncate text-xs text-subtle">{t.artist}</div>
            </div>
            <LikeButton track={t} className="p-2 [&_svg]:h-5 [&_svg]:w-5" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                p.toggle();
              }}
              aria-label={p.isPlaying ? 'השהה' : 'נגן'}
              className="p-2"
            >
              {p.isPlaying ? <Pause className="h-6 w-6 fill-white" /> : <Play className="h-6 w-6 fill-white" />}
            </button>
            <div dir="ltr" className="absolute inset-x-2 bottom-0 h-0.5 rounded bg-white/20">
              <div className="h-full rounded bg-white" style={{ width: `${p.duration ? (p.time / p.duration) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      )}
      {expanded && t && <NowPlaying onClose={() => setExpanded(false)} />}
    </>
  );
}
