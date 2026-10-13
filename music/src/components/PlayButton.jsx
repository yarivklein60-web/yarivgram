import { Pause, Play } from 'lucide-react';

export default function PlayButton({ playing, onClick, size = 'lg', className = '' }) {
  const dims = size === 'lg' ? 'h-14 w-14' : 'h-11 w-11';
  const icon = size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={playing ? 'השהה' : 'נגן'}
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent text-black shadow-lg shadow-black/40 transition hover:scale-105 hover:bg-accent-strong active:scale-95 ${dims} ${className}`}
    >
      {playing ? <Pause className={`${icon} fill-black`} /> : <Play className={`${icon} translate-x-[1px] fill-black`} />}
    </button>
  );
}
