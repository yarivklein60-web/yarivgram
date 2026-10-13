import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Card from '@/components/Card';
import CollectionHeader from '@/components/CollectionHeader';
import Cover from '@/components/Cover';
import PlayButton from '@/components/PlayButton';
import TrackList from '@/components/TrackList';
import UploadButton, { useUpload } from '@/components/UploadButton';
import { useLibrary } from '@/lib/library';
import { usePlayer } from '@/lib/player';
import { songCount } from '@/lib/format';

export default function LibraryPage() {
  const lib = useLibrary();
  const player = usePlayer();
  const navigate = useNavigate();
  const { upload } = useUpload();
  const [dragging, setDragging] = useState(false);
  const source = 'library';
  const playing = player.isPlaying && player.source === source;

  const lists = [
    { key: 'liked', to: '/liked', name: 'שירים שאהבתי', ids: lib.likedTracks.map((t) => t.id), cover: <Cover kind="liked" className="aspect-square w-full" /> },
    ...lib.playlists.map((p) => ({
      key: `playlist:${p.id}`,
      to: `/playlist/${p.id}`,
      name: p.name,
      ids: p.trackIds,
      cover: <Cover seed={p.id} kind="playlist" className="aspect-square w-full" />,
    })),
  ];

  return (
    <div
      className="relative min-h-full pb-8"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget) && setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        upload(e.dataTransfer.files);
      }}
    >
      <CollectionHeader label="הספרייה שלך" title="כל השירים" tracks={lib.tracks} hue={200} cover={<Cover seed="library" className="h-40 w-40 md:h-52 md:w-52" />}>
        <p className="mt-2 text-sm text-white/70">אפשר גם לגרור קובצי שמע לכאן</p>
      </CollectionHeader>

      <div className="flex flex-wrap items-center gap-4 px-4 py-5 md:px-6">
        {lib.tracks.length > 0 && (
          <PlayButton
            playing={playing}
            onClick={() => (player.source === source && player.current ? player.toggle() : player.playList(lib.tracks.map((t) => t.id), null, source))}
          />
        )}
        <UploadButton />
      </div>

      {lib.tracks.length > 0 ? (
        <TrackList tracks={lib.tracks} source={source} />
      ) : (
        <p className="px-6 py-10 text-center text-subtle">עדיין אין שירים. הוסף קבצים מהמכשיר.</p>
      )}

      <section className="mt-10 px-1 md:px-3">
        <div className="mb-1 flex items-center justify-between px-3">
          <h2 className="text-xl font-bold">פלייליסטים</h2>
          <button
            type="button"
            onClick={() => navigate(`/playlist/${lib.createPlaylist(`הפלייליסט שלי #${lib.playlists.length + 1}`).id}`)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-4 py-1.5 text-sm font-semibold transition hover:scale-[1.03] hover:border-white"
          >
            <Plus className="h-4 w-4" /> פלייליסט חדש
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {lists.map((l) => (
            <Card
              key={l.key}
              cover={l.cover}
              title={l.name}
              subtitle={songCount(l.ids.length)}
              onOpen={() => navigate(l.to)}
              onPlay={() => (player.source === l.key && player.current ? player.toggle() : player.playList(l.ids, null, l.key))}
              playing={player.isPlaying && player.source === l.key}
            />
          ))}
        </div>
      </section>

      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center bg-accent/20 backdrop-blur-sm">
          <div className="rounded-2xl border-2 border-dashed border-accent bg-base/90 px-10 py-8 text-xl font-bold">שחרר כדי להוסיף לספרייה</div>
        </div>
      )}
    </div>
  );
}
