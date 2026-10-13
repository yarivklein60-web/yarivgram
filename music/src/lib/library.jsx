import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { db } from './db';
import { DEMOS, DEMO_DURATION, renderDemo } from './synth';
import { parseFileName } from './format';

const LibraryContext = createContext(null);

function probeDuration(blob) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio();
    const done = (value) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => done(Number.isFinite(audio.duration) ? audio.duration : 0);
    audio.onerror = () => done(null);
    audio.src = url;
  });
}

// Storage failures (private mode, quota) must not break the app: state stays in memory.
const persist = (promise) => promise.catch((err) => console.warn('[yarivify] storage:', err));

export function LibraryProvider({ children }) {
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | seeding | ready

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let stored = [];
      let lists = [];
      try {
        [stored, lists] = await Promise.all([db.all('tracks'), db.all('playlists')]);
      } catch (err) {
        console.warn('[yarivify] storage unavailable, running in memory:', err);
      }

      const missing = DEMOS.filter((d) => !stored.some((t) => t.id === d.id));
      let seeded = false;
      try {
        seeded = await db.getMeta('seeded');
      } catch {
        // storage unavailable — seed into memory
      }
      if (!seeded && missing.length) {
        if (!cancelled) setStatus('seeding');
        const now = Date.now();
        const demos = await Promise.all(
          missing.map(async (d, i) => ({
            id: d.id,
            title: d.title,
            artist: d.artist,
            album: d.album,
            duration: DEMO_DURATION,
            blob: await renderDemo(d),
            liked: false,
            demo: true,
            addedAt: now - i,
          })),
        );
        stored = [...stored, ...demos];
        demos.forEach((t) => persist(db.put('tracks', t)));
        if (!lists.length) {
          const mix = {
            id: 'pl-demo',
            name: 'מיקס להתחלה',
            description: 'שירי הדוגמה שנוצרו בדפדפן',
            trackIds: demos.map((t) => t.id),
            createdAt: now,
          };
          lists = [mix];
          persist(db.put('playlists', mix));
        }
        persist(db.setMeta('seeded', true));
      }

      if (!cancelled) {
        setTracks(stored);
        setPlaylists(lists);
        setStatus('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const byId = useMemo(() => new Map(tracks.map((t) => [t.id, t])), [tracks]);

  const sortedTracks = useMemo(() => [...tracks].sort((a, b) => b.addedAt - a.addedAt), [tracks]);

  const addFiles = useCallback(async (files) => {
    const audio = [...files].filter((f) => f.type.startsWith('audio/') || /\.(mp3|m4a|wav|ogg|flac|aac|opus)$/i.test(f.name));
    const added = [];
    for (const file of audio) {
      const duration = await probeDuration(file);
      if (duration === null) continue; // browser can't decode it
      const { artist, title } = parseFileName(file.name);
      const track = {
        id: crypto.randomUUID(),
        title,
        artist,
        album: 'הועלה מהמכשיר',
        duration,
        blob: file,
        liked: false,
        addedAt: Date.now() + added.length,
      };
      added.push(track);
      persist(db.put('tracks', track));
    }
    if (added.length) setTracks((prev) => [...prev, ...added]);
    return { added: added.length, skipped: files.length - added.length };
  }, []);

  const updateTrack = useCallback((id, patch) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, ...patch };
        persist(db.put('tracks', next));
        return next;
      }),
    );
  }, []);

  const toggleLike = useCallback(
    (id) => {
      const track = byId.get(id);
      if (track) updateTrack(id, { liked: !track.liked, likedAt: Date.now() });
    },
    [byId, updateTrack],
  );

  const savePlaylist = (next) => {
    persist(db.put('playlists', next));
    return next;
  };

  const updatePlaylist = useCallback((id, fn) => {
    setPlaylists((prev) => prev.map((p) => (p.id === id ? savePlaylist(fn(p)) : p)));
  }, []);

  const deleteTrack = useCallback((id) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    persist(db.remove('tracks', id));
    setPlaylists((prev) =>
      prev.map((p) => (p.trackIds.includes(id) ? savePlaylist({ ...p, trackIds: p.trackIds.filter((t) => t !== id) }) : p)),
    );
  }, []);

  const createPlaylist = useCallback((name, trackIds = []) => {
    const playlist = { id: `pl-${crypto.randomUUID()}`, name, description: '', trackIds, createdAt: Date.now() };
    setPlaylists((prev) => [...prev, savePlaylist(playlist)]);
    return playlist;
  }, []);

  const deletePlaylist = useCallback((id) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    persist(db.remove('playlists', id));
  }, []);

  const renamePlaylist = useCallback((id, name) => updatePlaylist(id, (p) => ({ ...p, name })), [updatePlaylist]);

  const addToPlaylist = useCallback(
    (id, trackId) =>
      updatePlaylist(id, (p) => (p.trackIds.includes(trackId) ? p : { ...p, trackIds: [...p.trackIds, trackId] })),
    [updatePlaylist],
  );

  const removeFromPlaylist = useCallback(
    (id, trackId) => updatePlaylist(id, (p) => ({ ...p, trackIds: p.trackIds.filter((t) => t !== trackId) })),
    [updatePlaylist],
  );

  const likedTracks = useMemo(
    () => tracks.filter((t) => t.liked).sort((a, b) => (b.likedAt || 0) - (a.likedAt || 0)),
    [tracks],
  );

  const value = {
    status,
    tracks: sortedTracks,
    playlists,
    likedTracks,
    getTrack: (id) => byId.get(id),
    tracksOf: (playlist) => playlist.trackIds.map((id) => byId.get(id)).filter(Boolean),
    addFiles,
    updateTrack,
    toggleLike,
    deleteTrack,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addToPlaylist,
    removeFromPlaylist,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export const useLibrary = () => useContext(LibraryContext);
