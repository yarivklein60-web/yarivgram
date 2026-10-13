import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import Cover from '@/components/Cover';
import PlayButton from '@/components/PlayButton';
import TrackList from '@/components/TrackList';
import { useLibrary } from '@/lib/library';
import { usePlayer } from '@/lib/player';
import { hueOf } from '@/lib/format';

export default function Search() {
  const lib = useLibrary();
  const player = usePlayer();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const setQ = (value) => setParams(value ? { q: value } : {}, { replace: true });

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return lib.tracks.filter((t) => [t.title, t.artist, t.album].some((f) => f?.toLowerCase().includes(needle)));
  }, [q, lib.tracks]);

  const browse = useMemo(() => {
    const names = new Set();
    lib.tracks.forEach((t) => {
      names.add(t.artist);
      names.add(t.album);
    });
    return [...names].filter(Boolean);
  }, [lib.tracks]);

  const top = results[0];
  const source = `search:${q}`;

  return (
    <div className="min-h-full pb-8">
      <div className="sticky top-0 z-10 bg-panel/95 px-4 py-4 backdrop-blur md:px-6">
        <label className="relative block max-w-md">
          <SearchIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="מה בא לך לשמוע?"
            className="w-full rounded-full bg-elevated py-3 pl-10 pr-12 text-sm outline-none ring-white/80 transition placeholder:text-subtle hover:bg-hover focus:ring-2"
          />
          {q && (
            <button type="button" onClick={() => setQ('')} aria-label="ניקוי" className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle hover:text-white">
              <X className="h-5 w-5" />
            </button>
          )}
        </label>
      </div>

      {!q && (
        <div className="px-4 md:px-6">
          <h2 className="mb-4 mt-2 text-xl font-bold">עיון</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {browse.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setQ(name)}
                className="relative aspect-[1.6] overflow-hidden rounded-lg p-4 text-right text-lg font-bold transition hover:brightness-110"
                style={{ background: `hsl(${hueOf(name)} 60% 38%)` }}
              >
                {name}
                <Cover seed={name} className="absolute -bottom-2 -left-4 h-20 w-20 rotate-[25deg] shadow-xl" />
              </button>
            ))}
          </div>
        </div>
      )}

      {q && !results.length && (
        <div className="px-6 pt-16 text-center">
          <h2 className="text-xl font-bold">לא נמצאו תוצאות עבור "{q}"</h2>
          <p className="mt-2 text-subtle">בדוק את האיות או נסה מילה אחרת.</p>
        </div>
      )}

      {top && (
        <div className="grid gap-6 px-4 md:px-6 lg:grid-cols-[22rem_1fr]">
          <section>
            <h2 className="mb-3 text-xl font-bold">התוצאה המובילה</h2>
            <div className="group relative rounded-lg bg-elevated p-5 transition hover:bg-hover">
              <Cover seed={top.id} className="h-24 w-24 shadow-lg shadow-black/40" />
              <div className="mt-5 truncate text-3xl font-bold">{top.title}</div>
              <div className="mt-1 text-sm text-subtle">
                שיר · <span className="text-white">{top.artist}</span>
              </div>
              <PlayButton
                playing={player.isPlaying && player.current?.id === top.id}
                onClick={() =>
                  player.current?.id === top.id ? player.toggle() : player.playList(results.map((t) => t.id), top.id, source)
                }
                className="absolute bottom-5 left-5 opacity-100 md:opacity-0 md:group-hover:opacity-100"
              />
            </div>
          </section>
          <section className="min-w-0">
            <h2 className="mb-3 text-xl font-bold">שירים</h2>
            <div className="-mx-2 md:-mx-6">
              <TrackList tracks={results} source={source} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
