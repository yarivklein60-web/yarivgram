import { useNavigate } from 'react-router-dom';
import Card from '@/components/Card';
import Cover from '@/components/Cover';
import PlayButton from '@/components/PlayButton';
import UploadButton from '@/components/UploadButton';
import { useLibrary } from '@/lib/library';
import { usePlayer } from '@/lib/player';
import { greeting } from '@/lib/format';

function QuickTile({ cover, title, onOpen, onPlay, playing }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      className="group flex cursor-pointer items-center gap-3 overflow-hidden rounded-md bg-white/[0.07] pl-2 transition hover:bg-white/[0.14]"
    >
      {cover}
      <span className="min-w-0 flex-1 truncate text-sm font-bold">{title}</span>
      <PlayButton
        size="md"
        playing={playing}
        onClick={(e) => {
          e.stopPropagation();
          onPlay();
        }}
        className={`hidden h-9 w-9 md:flex ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      />
    </div>
  );
}

export default function Home() {
  const lib = useLibrary();
  const player = usePlayer();
  const navigate = useNavigate();

  const isSource = (key) => player.isPlaying && player.source === key;
  const playOrToggle = (key, ids) => (player.source === key && player.current ? player.toggle() : player.playList(ids, null, key));

  const quick = [
    {
      key: 'liked',
      title: 'שירים שאהבתי',
      to: '/liked',
      ids: lib.likedTracks.map((t) => t.id),
      cover: <Cover kind="liked" className="h-14 w-14" rounded="rounded-none" />,
    },
    ...lib.playlists.map((p) => ({
      key: `playlist:${p.id}`,
      title: p.name,
      to: `/playlist/${p.id}`,
      ids: p.trackIds,
      cover: <Cover seed={p.id} kind="playlist" className="h-14 w-14" rounded="rounded-none" />,
    })),
  ].slice(0, 8);

  const recent = lib.tracks.slice(0, 12);

  const albums = Object.values(
    lib.tracks.reduce((acc, t) => {
      (acc[t.album] ||= { name: t.album, artist: t.artist, tracks: [] }).tracks.push(t);
      return acc;
    }, {}),
  );

  return (
    <div className="min-h-full bg-gradient-to-b from-emerald-900/50 via-panel to-panel pb-8">
      <div className="px-4 pt-6 md:px-6">
        <h1 className="text-2xl font-bold md:text-3xl">{greeting()}</h1>
        <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {quick.map((q) => (
            <QuickTile
              key={q.key}
              cover={q.cover}
              title={q.title}
              onOpen={() => navigate(q.to)}
              onPlay={() => playOrToggle(q.key, q.ids)}
              playing={isSource(q.key)}
            />
          ))}
        </div>
      </div>

      {recent.length === 0 ? (
        <div className="mx-4 mt-10 rounded-xl bg-elevated p-8 text-center md:mx-6">
          <h2 className="text-xl font-bold">הספרייה ריקה</h2>
          <p className="mt-2 text-subtle">הוסף קובצי MP3 מהמכשיר כדי להתחיל להאזין.</p>
          <UploadButton className="mt-5" />
        </div>
      ) : (
        <>
          <Section title="נוספו לאחרונה" onMore={() => navigate('/library')}>
            {recent.map((t) => (
              <Card
                key={t.id}
                cover={<Cover seed={t.id} className="aspect-square w-full shadow-lg shadow-black/40" />}
                title={t.title}
                subtitle={t.artist}
                onOpen={() => player.playList(recent.map((r) => r.id), t.id, 'recent')}
                onPlay={() =>
                  player.current?.id === t.id ? player.toggle() : player.playList(recent.map((r) => r.id), t.id, 'recent')
                }
                playing={player.isPlaying && player.current?.id === t.id}
              />
            ))}
          </Section>

          <Section title="אלבומים">
            {albums.map((a) => {
              const key = `album:${a.name}`;
              return (
                <Card
                  key={a.name}
                  cover={<Cover seed={a.name} className="aspect-square w-full shadow-lg shadow-black/40" />}
                  title={a.name}
                  subtitle={a.artist}
                  onOpen={() => navigate(`/search?q=${encodeURIComponent(a.name)}`)}
                  onPlay={() => playOrToggle(key, a.tracks.map((t) => t.id))}
                  playing={isSource(key)}
                />
              );
            })}
          </Section>
        </>
      )}
    </div>
  );
}

function Section({ title, onMore, children }) {
  return (
    <section className="mt-8 px-1 md:px-3">
      <div className="mb-1 flex items-end justify-between px-3">
        <h2 className="text-xl font-bold">{title}</h2>
        {onMore && (
          <button type="button" onClick={onMore} className="text-sm font-semibold text-subtle hover:text-white hover:underline">
            הצג הכל
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{children}</div>
    </section>
  );
}
