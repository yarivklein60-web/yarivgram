// Minimal IndexedDB wrapper. Audio blobs live here so uploaded songs survive reloads.
const DB_NAME = 'yarivify';
const VERSION = 1;

let dbPromise;

function open() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        db.createObjectStore('tracks', { keyPath: 'id' });
        db.createObjectStore('playlists', { keyPath: 'id' });
        db.createObjectStore('meta');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function run(store, mode, fn) {
  return open().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const req = fn(tx.objectStore(store));
        tx.oncomplete = () => resolve(req?.result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      }),
  );
}

export const db = {
  all: (store) => run(store, 'readonly', (s) => s.getAll()),
  put: (store, value) => run(store, 'readwrite', (s) => s.put(value)),
  remove: (store, id) => run(store, 'readwrite', (s) => s.delete(id)),
  getMeta: (key) => run('meta', 'readonly', (s) => s.get(key)),
  setMeta: (key, value) => run('meta', 'readwrite', (s) => s.put(value, key)),
};
