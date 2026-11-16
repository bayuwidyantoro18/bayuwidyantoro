let request;
const database = () => request ??= new Promise((resolve, reject) => {
  const open = indexedDB.open('bayu-portfolio-demo-files',1);
  open.onupgradeneeded = () => open.result.createObjectStore('files');
  open.onsuccess = () => resolve(open.result);
  open.onerror = () => reject(open.error);
});

const memory = new Map();
export function markFile(blob) {
  const key = document.body.dataset.demo + ':' + crypto.randomUUID();
  memory.set(key,blob);
  database().then(db => db.transaction('files','readwrite').objectStore('files').put(blob,key)).catch(() => {});
  return key;
}
export async function uploadedFile(key) {
  if (!key) return null;
  if (memory.has(key)) return memory.get(key);
  try {
    const db = await database();
    return await new Promise((resolve,reject) => {
      const read = db.transaction('files').objectStore('files').get(key);
      read.onsuccess = () => resolve(read.result ?? null);
      read.onerror = () => reject(read.error);
    });
  } catch {
    return null;
  }
}
