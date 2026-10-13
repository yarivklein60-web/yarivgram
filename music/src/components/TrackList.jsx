import { useState } from 'react';
import { Clock3, MoreHorizontal, Pause, Play } from 'lucide-react';
import Cover from './Cover';
import Equalizer from './Equalizer';
import LikeButton from './LikeButton';
import TrackMenu from './TrackMenu';
import { usePlayer } from '@/lib/player';
import { formatTime } from '@/lib/format';

export default function TrackList({ tracks, source, playlistId, showAlbum = true }) {
  const player = usePlayer();
  const [menu, setMenu] = useState(null); // { track, anchor }
  const ids = tracks.map((t) => t.id);

  const play = (track) => {
    const isCurrent = player.current?.id === track.id && player.source === source;
    if (isCurrent) player.toggle();
    else player.playList(ids, track.id, source);
  };

  return (
    <div className="px-2 md:px-6">
      <div className="grid grid-cols-[2rem_1fr_auto] items-center gap-4 border-b border-line px-3 pb-2 text-xs text-subtle md:grid-cols-[2rem_1.4fr_1fr_auto]">
        <span className="text-center">#</span>
        <span>כותרת</span>
        {showAlbum && <span className="hidden md:block">אלבום</span>}
        {!showAlbum && <span className="hidden md:block" />}
        <span className="flex w-[6.5rem] justify-center">
          <Clock3 className="h-4 w-4" aria-label="משך" />
        </span>
      </div>

      <ul className="mt-2">
        {tracks.map((track, i) => {
          const isCurrent = player.current?.id === track.id;
          const playing = isCurrent && player.isPlaying;
          return (
            <li
              key={track.id}
              onClick={() => play(track)}
              onContextMenu={(e) => {
                e.preventDefault();
                setMenu({ track, anchor: e.currentTarget.querySelector('[data-more]') });
              }}
              className={`group grid cursor-pointer grid-cols-[2rem_1fr_auto] items-center gap-4 rounded-md px-3 py-2 transition hover:bg-white/[0.07] md:grid-cols-[2rem_1.4fr_1fr_auto] ${
                menu?.track.id === track.id ? 'bg-white/[0.1]' : ''
              }`}
            >
              <span className="flex justify-center text-sm tabular-nums text-subtle">
                <span className="group-hover:hidden">{isCurrent ? <Equalizer playing={playing} /> : i + 1}</span>
                <span className="hidden text-white group-hover:block">
                  {playing ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white" />}
                </span>
              </span>

              <div className="flex min-w-0 items-center gap-3">
                <Cover seed={track.id} className="h-10 w-10" rounded="rounded" />
                <div className="min-w-0">
                  <div className={`truncate font-medium ${isCurrent ? 'text-accent' : 'text-white'}`}>{track.title}</div>
                  <div className="truncate text-sm text-subtle">{track.artist}</div>
                </div>
              </div>

              <span className="hidden truncate text-sm text-subtle md:block">{showAlbum ? track.album : ''}</span>

              <div className="flex w-[6.5rem] items-center justify-end gap-3">
                <LikeButton track={track} className={track.liked ? '' : 'opacity-0 group-hover:opacity-100 max-md:opacity-100'} />
                <span className="w-9 text-left text-sm tabular-nums text-subtle">{formatTime(track.duration)}</span>
                <button
                  type="button"
                  data-more
                  aria-label={`אפשרויות עבור ${track.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenu(menu?.track.id === track.id ? null : { track, anchor: e.currentTarget });
                  }}
                  className="text-subtle opacity-100 transition hover:text-white md:opacity-0 md:group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {menu && <TrackMenu track={menu.track} anchor={menu.anchor} playlistId={playlistId} onClose={() => setMenu(null)} />}
    </div>
  );
}
