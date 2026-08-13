import type { PracticeRecord } from "@/types/content";

const DB_NAME = "malo-academy";
const STORE = "practice";
const VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function keyOf(moduleId: string, blockTitle: string) {
  return `${moduleId}::${blockTitle}`;
}

export async function savePractice(record: PracticeRecord) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ key: keyOf(record.moduleId, record.blockTitle), ...record });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadPractice(moduleId: string, blockTitle: string) {
  const db = await openDb();
  const row = await new Promise<PracticeRecord | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(keyOf(moduleId, blockTitle));
    req.onsuccess = () => {
      const v = req.result as (PracticeRecord & { key: string }) | undefined;
      if (!v) return resolve(undefined);
      const { key: _k, ...rest } = v;
      resolve(rest);
    };
    req.onerror = () => reject(req.error);
  });
  db.close();
  return row;
}

export async function loadAllPractice() {
  const db = await openDb();
  const rows = await new Promise<PracticeRecord[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const list = (req.result as Array<PracticeRecord & { key: string }>).map(({ key: _k, ...rest }) => rest);
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
  db.close();
  return rows;
}
