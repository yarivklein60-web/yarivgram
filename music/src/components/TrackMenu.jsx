import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, ListEnd, ListMinus, ListPlus, Plus, Trash2 } from 'lucide-react';
import Menu, { MenuDivider, MenuItem } from './Menu';
import { useLibrary } from '@/lib/library';
import { usePlayer } from '@/lib/player';
import { useToast } from '@/lib/toast';

export default function TrackMenu({ track, anchor, onClose, playlistId }) {
  const lib = useLibrary();
  const player = usePlayer();
  const toast = useToast();
  const navigate = useNavigate();
  const [picking, setPicking] = useState(false);

  const act = (fn) => () => {
    fn();
    onClose();
  };

  if (picking) {
    return (
      <Menu anchor={anchor} onClose={onClose}>
        <MenuItem icon={ChevronLeft} onClick={() => setPicking(false)}>
          חזרה
        </MenuItem>
        <MenuDivider />
        <MenuItem
          icon={Plus}
          onClick={act(() => {
            const pl = lib.createPlaylist(`הפלייליסט שלי #${lib.playlists.length + 1}`, [track.id]);
            toast(`נוסף ל"${pl.name}"`);
            navigate(`/playlist/${pl.id}`);
          })}
        >
          פלייליסט חדש
        </MenuItem>
        {lib.playlists.map((p) => {
          const has = p.trackIds.includes(track.id);
          return (
            <MenuItem
              key={p.id}
              onClick={act(() => {
                if (has) return toast(`כבר נמצא ב"${p.name}"`);
                lib.addToPlaylist(p.id, track.id);
                toast(`נוסף ל"${p.name}"`);
              })}
            >
              {p.name}
              {has && <span className="mr-2 text-xs text-accent">✓</span>}
            </MenuItem>
          );
        })}
      </Menu>
    );
  }

  return (
    <Menu anchor={anchor} onClose={onClose}>
      <MenuItem icon={ListPlus} onClick={() => setPicking(true)}>
        הוספה לפלייליסט
      </MenuItem>
      <MenuItem
        icon={ListEnd}
        onClick={act(() => {
          player.addToQueue(track.id);
          toast('יתנגן הבא בתור');
        })}
      >
        הוספה לתור
      </MenuItem>
      <MenuItem icon={Heart} onClick={act(() => lib.toggleLike(track.id))}>
        {track.liked ? 'הסרה מהשירים שאהבתי' : 'הוספה לשירים שאהבתי'}
      </MenuItem>
      {playlistId && (
        <MenuItem icon={ListMinus} onClick={act(() => lib.removeFromPlaylist(playlistId, track.id))}>
          הסרה מהפלייליסט
        </MenuItem>
      )}
      <MenuDivider />
      <MenuItem
        icon={Trash2}
        danger
        onClick={act(() => {
          if (window.confirm(`למחוק את "${track.title}" מהספרייה?`)) {
            lib.deleteTrack(track.id);
            toast('השיר נמחק');
          }
        })}
      >
        מחיקה מהספרייה
      </MenuItem>
    </Menu>
  );
}
