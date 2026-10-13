import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Plus, Shuffle, Trash2, X } from 'lucide-react';
import CollectionHeader from '@/components/CollectionHeader';
import Cover from '@/components/Cover';
import PlayButton from '@/components/PlayButton';
import TrackList from '@/components/TrackList';
import { useLibrary } from '@/lib/library';
import { usePlayer } from '@/lib/player';
import { useToast } from '@/lib/toast';
import { formatTime, hueOf } from '@/lib/format';

function AddSongs({ playlist, onClose }) {
  const lib = useLibrary();
  const candidates = lib.tracks.filter((t) => !playlist.trackIds.includes(t.id));
  return (
    <section className="mx-4 mt-8 rounded-xl bg-elevated p-4 md:mx-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">נוסיף משהו לפלייליסט?</h2>
        <button type="button" onClick={onClose} aria-label="סגירה" className="text-subtle hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>
      {candidates.length === 0 ? (
        <p className="text-sm text-subtle">כל השירים בספרייה כבר נמצאים כאן.</p>
      ) : (
        <ul>
          {candidates.map((t) => (
            <li key={t.id} className="flex items-center gap-3 rounded-md p-2 hover:bg-hover">
              <Cover seed={t.id} className="h-10 w-10" rounded="rounded" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{t.title}</div>
                <div className="truncate text-xs text-subtle">{t.artist}</div>
              </div>
              <span className="text-sm tabular-nums text-subtle">{formatTime(t.duration)}</span>
              <button
                type="button"
                onClick={() => lib.addToPlaylist(playlist.id, t.id)}
                className="rounded-full border border-white/30 px-4 py-1 text-sm font-semibold transition hover:scale-105 hover:border-white"
              >
                הוספה
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Playlist({ liked = false }) {
  const { id } = useParams();
  const lib = useLibrary();
  const player = usePlayer();
  const toast = useToast();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const playlist = liked ? null : lib.playlists.find((p) => p.id === id);
  if (!liked && !playlist) return <Navigate to="/library" replace />;

  const tracks = liked ? lib.likedTracks : lib.tracksOf(playlist);
  const source = liked ? 'liked' : `playlist:${playlist.id}`;
  const playing = player.isPlaying && player.source === source;

  const playAll = () =>
    player.source === source && player.current ? player.toggle() : player.playList(tracks.map((t) => t.id), null, source);

  const rename = () => {
    const name = window.prompt('שם הפלייליסט', playlist.name)?.trim();
    if (name) lib.renamePlaylist(playlist.id, name);
  };

  const remove = () => {
    if (!window.confirm(`למחוק את "${playlist.name}"?`)) return;
    lib.deletePlaylist(playlist.id);
    toast('הפלייליסט נמחק');
    navigate('/library');
  };

  return (
    <div className="min-h-full pb-8">
      <CollectionHeader
        label="פלייליסט"
        title={liked ? 'שירים שאהבתי' : playlist.name}
        tracks={tracks}
        hue={liked ? 250 : hueOf(playlist.id)}
        onTitleClick={liked ? undefined : rename}
        cover={liked ? <Cover kind="liked" className="h-40 w-40 md:h-52 md:w-52" /> : <Cover seed={playlist.id} kind="playlist" className="h-40 w-40 md:h-52 md:w-52" />}
      >
        {playlist?.description && <p className="mt-2 text-sm text-white/70">{playlist.description}</p>}
      </CollectionHeader>

      <div className="flex items-center gap-6 px-4 py-5 md:px-6">
        {tracks.length > 0 && <PlayButton playing={playing} onClick={playAll} />}
        <button
          type="button"
          onClick={player.toggleShuffle}
          aria-label="ערבוב"
          aria-pressed={player.shuffle}
          className={`transition hover:scale-105 ${player.shuffle ? 'text-accent' : 'text-subtle hover:text-white'}`}
        >
          <Shuffle className="h-7 w-7" />
        </button>
        {!liked && (
          <>
            <button type="button" onClick={() => setAdding(true)} aria-label="הוספת שירים" title="הוספת שירים" className="text-subtle transition hover:scale-105 hover:text-white">
              <Plus className="h-7 w-7" />
            </button>
            <button type="button" onClick={remove} aria-label="מחיקת הפלייליסט" title="מחיקת הפלייליסט" className="text-subtle transition hover:scale-105 hover:text-red-400">
              <Trash2 className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {tracks.length > 0 ? (
        <TrackList tracks={tracks} source={source} playlistId={playlist?.id} />
      ) : (
        <p className="px-6 py-6 text-center text-subtle">
          {liked ? 'שירים שתסמן בלב יופיעו כאן.' : 'הפלייליסט ריק.'}
        </p>
      )}

      {!liked && (adding || tracks.length === 0) && <AddSongs playlist={playlist} onClose={() => setAdding(false)} />}
    </div>
  );
}
