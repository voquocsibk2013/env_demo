// storage.js — tiny dependency-free IndexedDB key/value store.
//
// Why this exists:
//   The app used to keep ALL projects in a single localStorage key. localStorage
//   is capped at ~5 MB and stores strings, so a large Environmental Budget result
//   could push the blob over the limit and the save would fail. IndexedDB has a
//   far larger quota (typically hundreds of MB to GBs), stores structured data
//   natively (no JSON string-size doubling), and is asynchronous so it never
//   blocks the UI. It is 100% client-side — no server or backend required.
//
// API (all Promise-based):
//   idbAvailable()      -> boolean   (false on very old browsers / privacy modes)
//   idbGet(key)         -> Promise<value | undefined>
//   idbSet(key, value)  -> Promise<void>
//   idbDel(key)         -> Promise<void>

const DB_NAME    = "env-toolkit";
const STORE_NAME = "kv";
const DB_VERSION = 1;

let _dbPromise = null;

function openDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    let req;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (e) {
      reject(e);
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
    req.onblocked = () => reject(new Error("IndexedDB open blocked"));
  });
  return _dbPromise;
}

export function idbAvailable() {
  try {
    return typeof indexedDB !== "undefined" && indexedDB !== null;
  } catch (e) {
    return false;
  }
}

export async function idbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

export async function idbSet(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
    // onabort fires on quota errors even when the request itself looked fine
    tx.onabort    = () => reject(tx.error || new Error("IndexedDB write aborted (quota exceeded?)"));
  });
}

export async function idbDel(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}
