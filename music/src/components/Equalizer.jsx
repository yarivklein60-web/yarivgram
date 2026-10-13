export default function Equalizer({ playing = true }) {
  return (
    <span className="inline-flex h-3.5 items-end gap-[2px]" aria-hidden>
      {[0, 0.25, 0.5].map((delay) => (
        <span
          key={delay}
          className={`w-[3px] origin-bottom rounded-sm bg-accent ${playing ? 'animate-eq' : ''}`}
          style={{ height: '100%', animationDelay: `${delay}s`, transform: playing ? undefined : 'scaleY(0.35)' }}
        />
      ))}
    </span>
  );
}
