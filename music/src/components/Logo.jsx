export default function Logo() {
  return (
    <div className="flex items-center gap-2 px-2 text-xl font-extrabold tracking-tight">
      <svg viewBox="0 0 64 64" className="h-8 w-8" aria-hidden>
        <rect width="64" height="64" rx="16" fill="#22d07a" />
        <g fill="#0b0b0d">
          <rect x="14" y="26" width="6" height="12" rx="3" />
          <rect x="24" y="18" width="6" height="28" rx="3" />
          <rect x="34" y="22" width="6" height="20" rx="3" />
          <rect x="44" y="28" width="6" height="8" rx="3" />
        </g>
      </svg>
      Yarivify
    </div>
  );
}
