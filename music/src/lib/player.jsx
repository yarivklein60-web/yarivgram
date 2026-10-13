import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLibrary } from './library';

const PlayerContext = createContext(null);

const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // per-device convenience only
  }
};

function shuffled(ids, firstId) {
  const rest = ids.filter((id) => id !== firstId);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return firstId ? [firstId, ...rest] : rest;
}

export function PlayerProvider({ children }) {
  const { getTrack } = useLibrary();
  const audioRef = useRef(null);
  if (!audioRef.current && typeof Audio !== 'undefined') audioRef.current = new Audio();
  const urlRef = useRef(null);

  const [queue, setQueue] = useState([]); // order actually played
  const [baseQueue, setBaseQueue] = useState([]); // order before shuffle
  const [index, setIndex] = useState(-1);
  // Bumped on every explicit play/skip, so reordering the queue never restarts the song.
  const [playToken, setPlayToken] = useState(0);
  const [source, setSource] = useState(null); // which list started playback, e.g. 'playlist:pl-1'
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(() => load('yv.volume', 0.8));
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(() => load('yv.shuffle', false));
  const [repeat, setRepeat] = useState(() => load('yv.repeat', 'off')); // off | all | one

  const currentId = queue[index];
  const current = currentId ? getTrack(currentId) : null;

  // Load the blob for the current track whenever it changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!current) {
      audio.pause();
      audio.removeAttribute('src');
      setIsPlaying(false);
      return;
    }
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = URL.createObjectURL(current.blob);
    audio.src = urlRef.current;
    setTime(0);
    setDuration(current.duration || 0);
    audio.play().catch(() => setIsPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, playToken]);

  const go = useCallback((i) => {
    setIndex(i);
    setPlayToken((n) => n + 1);
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
    save('yv.volume', volume);
  }, [volume, muted]);

  useEffect(() => save('yv.shuffle', shuffle), [shuffle]);
  useEffect(() => save('yv.repeat', repeat), [repeat]);

  const next = useCallback(
    (auto = false) => {
      if (!queue.length) return;
      if (index < queue.length - 1) go(index + 1);
      else if (repeat === 'all' || !auto) go(0);
      else {
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
      }
    },
    [queue.length, index, repeat, go],
  );

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !queue.length) return;
    if (audio.currentTime > 3 || index === 0) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } else go(index - 1);
  }, [queue.length, index, go]);

  // Audio element events. Handlers read latest state through a ref.
  const handlersRef = useRef({});
  handlersRef.current = { next, repeat };
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setTime(audio.currentTime);
    const onMeta = () => Number.isFinite(audio.duration) && setDuration(audio.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      if (handlersRef.current.repeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else handlersRef.current.next(true);
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const playList = useCallback(
    (ids, startId = null, src = null) => {
      if (!ids.length) return;
      const first = startId ?? (shuffle ? ids[Math.floor(Math.random() * ids.length)] : ids[0]);
      const order = shuffle ? shuffled(ids, first) : ids;
      setBaseQueue(ids);
      setQueue(order);
      go(order.indexOf(first));
      setSource(src);
    },
    [shuffle, go],
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, [current]);

  const seek = useCallback((t) => {
    if (audioRef.current) {
      audioRef.current.currentTime = t;
      setTime(t);
    }
  }, []);

  const setVolume = useCallback((v) => {
    setVolumeState(v);
    if (v > 0) setMuted(false);
  }, []);

  const toggleShuffle = useCallback(() => {
    if (currentId) {
      const order = shuffle ? baseQueue : shuffled(baseQueue, currentId);
      setQueue(order);
      setIndex(order.indexOf(currentId));
    }
    setShuffle(!shuffle);
  }, [shuffle, baseQueue, currentId]);

  const cycleRepeat = useCallback(() => setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')), []);

  const addToQueue = useCallback(
    (id) => {
      if (!queue.length) return playList([id]);
      setQueue((q) => [...q.slice(0, index + 1), id, ...q.slice(index + 1)]);
      setBaseQueue((q) => [...q, id]);
    },
    [queue.length, index, playList],
  );

  // Drop deleted tracks from the queue.
  useEffect(() => {
    if (!queue.length || queue.every((id) => getTrack(id))) return;
    const kept = queue.filter((id) => getTrack(id));
    setBaseQueue((q) => q.filter((id) => getTrack(id)));
    setQueue(kept);
    const stillThere = kept.indexOf(currentId);
    setIndex(stillThere >= 0 ? stillThere : Math.min(index, kept.length - 1));
  });

  // OS media controls (lock screen, headphones, keyboard media keys).
  useEffect(() => {
    if (!('mediaSession' in navigator) || !current) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.artist,
      album: current.album,
    });
    const actions = {
      play: () => audioRef.current?.play(),
      pause: () => audioRef.current?.pause(),
      previoustrack: prev,
      nexttrack: () => next(),
      seekto: (e) => seek(e.seekTime),
    };
    for (const [action, fn] of Object.entries(actions)) {
      try {
        navigator.mediaSession.setActionHandler(action, fn);
      } catch {
        // unsupported action
      }
    }
  }, [current, prev, next, seek]);

  // Space toggles playback unless typing.
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space' || e.target.closest('input, textarea, button, [contenteditable]')) return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  const value = {
    current,
    queue,
    index,
    source,
    isPlaying,
    time,
    duration,
    volume,
    muted,
    shuffle,
    repeat,
    playList,
    toggle,
    next: () => next(false),
    prev,
    seek,
    setVolume,
    toggleMute: () => setMuted((m) => !m),
    toggleShuffle,
    cycleRepeat,
    addToQueue,
    jumpTo: go,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export const usePlayer = () => useContext(PlayerContext);
