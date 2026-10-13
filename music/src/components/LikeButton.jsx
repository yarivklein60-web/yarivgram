import { Heart } from 'lucide-react';
import { useLibrary } from '@/lib/library';

export default function LikeButton({ track, className = '' }) {
  const { toggleLike } = useLibrary();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleLike(track.id);
      }}
      aria-label={track.liked ? 'הסרה מהשירים שאהבתי' : 'הוספה לשירים שאהבתי'}
      aria-pressed={track.liked}
      className={`transition hover:scale-110 ${track.liked ? 'text-accent' : 'text-subtle hover:text-white'} ${className}`}
    >
      <Heart className={`h-4 w-4 ${track.liked ? 'fill-accent' : ''}`} />
    </button>
  );
}
