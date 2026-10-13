import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Library, Plus, Search, Volume2 } from 'lucide-react';
import Cover from './Cover';
import Logo from './Logo';
import { useLibrary } from '@/lib/library';
import { usePlayer } from '@/lib/player';
import { songCount } from '@/lib/format';

const navClass = ({ isActive }) =>
  `flex items-center gap-4 rounded-md px-3 py-2 font-semibold transition ${isActive ? 'text-white' : 'text-subtle hover:text-white'}`;

function LibraryLink({ to, cover, title, subtitle, active }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-md p-2 transition hover:bg-hover ${isActive ? 'bg-elevated' : ''}`
      }
    >
      {cover}
      <div className="min-w-0 flex-1">
        <div className={`truncate text-sm font-medium ${active ? 'text-accent' : ''}`}>{title}</div>
        <div className="truncate text-xs text-subtle">{subtitle}</div>
      </div>
      {active && <Volume2 className="h-4 w-4 shrink-0 text-accent" />}
    </NavLink>
  );
}

export default function Sidebar() {
  const lib = useLibrary();
  const { source, isPlaying } = usePlayer();
  const navigate = useNavigate();
  const playingFrom = (key) => isPlaying && source === key;

  const newPlaylist = () => {
    const pl = lib.createPlaylist(`הפלייליסט שלי #${lib.playlists.length + 1}`);
    navigate(`/playlist/${pl.id}`);
  };

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-2 md:flex">
      <div className="rounded-xl bg-panel px-3 py-4">
        <div className="mb-4">
          <Logo />
        </div>
        <nav className="space-y-1">
          <NavLink to="/" end className={navClass}>
            <Home className="h-6 w-6" /> בית
          </NavLink>
          <NavLink to="/search" className={navClass}>
            <Search className="h-6 w-6" /> חיפוש
          </NavLink>
        </nav>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-panel">
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <NavLink to="/library" className="flex items-center gap-3 font-semibold text-subtle transition hover:text-white">
            <Library className="h-6 w-6" /> הספרייה שלך
          </NavLink>
          <button
            type="button"
            onClick={newPlaylist}
            aria-label="יצירת פלייליסט"
            title="יצירת פלייליסט"
            className="rounded-full p-1.5 text-subtle transition hover:bg-hover hover:text-white"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-2 scroll-thin">
          <LibraryLink
            to="/liked"
            cover={<Cover kind="liked" className="h-12 w-12" />}
            title="שירים שאהבתי"
            subtitle={`פלייליסט · ${songCount(lib.likedTracks.length)}`}
            active={playingFrom('liked')}
          />
          {lib.playlists.map((p) => (
            <LibraryLink
              key={p.id}
              to={`/playlist/${p.id}`}
              cover={<Cover seed={p.id} kind="playlist" className="h-12 w-12" />}
              title={p.name}
              subtitle={`פלייליסט · ${songCount(p.trackIds.length)}`}
              active={playingFrom(`playlist:${p.id}`)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
