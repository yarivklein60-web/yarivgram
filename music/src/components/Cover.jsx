import { Heart, ListMusic, Music } from 'lucide-react';
import { hueOf } from '@/lib/format';

// Generated artwork: a stable two-tone gradient per track/playlist.
export default function Cover({ seed, kind = 'track', className = '', rounded = 'rounded-md' }) {
  if (kind === 'liked') {
    return (
      <div className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-500 to-emerald-300 ${rounded} ${className}`}>
        <Heart className="h-[38%] w-[38%] fill-white text-white" />
      </div>
    );
  }
  const h = hueOf(seed || '');
  const Icon = kind === 'playlist' ? ListMusic : Music;
  return (
    <div
      className={`flex shrink-0 items-center justify-center ${rounded} ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${h} 70% 52%), hsl(${(h + 50) % 360} 75% 28%))` }}
    >
      <Icon className="h-[40%] w-[40%] text-white/80" strokeWidth={1.75} />
    </div>
  );
}
