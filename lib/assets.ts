/**
 * Generated audio, kept in the browser. IndexedDB rather than localStorage
 * because these are blobs, and localStorage would both blow its quota and force
 * a base64 round-trip on every read.
 */
export interface Asset {
  id: string;
  kind: "speech" | "dub" | "studio";
  title: string;
  voice: string;
  createdAt: number;
  blob: Blob;
}

export type AssetSummary = Omit<Asset, "blob">;

const DATABASE = "talktin";
const STORE = "assets";
const VERSION = 1;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("This browser has no storage for saved audio."));
      return;
    }
    const request = indexedDB.open(DATABASE, VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE, { keyPath: "id" }).createIndex("createdAt", "createdAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open storage."));
  });
}

function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(STORE, mode);
        const request = work(transaction.objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("Storage request failed."));
        transaction.oncomplete = () => database.close();
      }),
  );
}

export async function saveAsset(asset: Omit<Asset, "id" | "createdAt">): Promise<Asset> {
  const record: Asset = { ...asset, id: crypto.randomUUID(), createdAt: Date.now() };
  await run("readwrite", (store) => store.put(record));
  return record;
}

/** Newest first, which is the only order a history list is ever wanted in. */
export async function listAssets(): Promise<Asset[]> {
  const all = await run<Asset[]>("readonly", (store) => store.getAll());
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteAsset(id: string): Promise<void> {
  await run("readwrite", (store) => store.delete(id));
}

export async function clearAssets(): Promise<void> {
  await run("readwrite", (store) => store.clear());
}

/** "3 minutes ago" — enough for a history list, without pulling in a date library. */
export function ago(timestamp: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
