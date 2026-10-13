import PlayButton from './PlayButton';

// Grid card with a play button that rises on hover.
export default function Card({ cover, title, subtitle, onOpen, onPlay, playing }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      className="group cursor-pointer rounded-lg p-3 transition hover:bg-elevated"
    >
      <div className="relative mb-3">
        {cover}
        <PlayButton
          size="md"
          playing={playing}
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className={`absolute bottom-2 left-2 transition-all duration-200 ${
            playing ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
          }`}
        />
      </div>
      <div className="truncate font-semibold">{title}</div>
      <div className="mt-1 line-clamp-2 text-sm text-subtle">{subtitle}</div>
    </div>
  );
}
