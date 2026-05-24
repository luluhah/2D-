import type { Asset, GenerateParams, ProjectSettings } from "../types/asset";

const databaseName = "game-asset-forge";
const databaseVersion = 1;
const storeName = "settings";

const keys = {
  assets: "assets",
  params: "params",
  projectSettings: "project-settings",
};

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readValue<TValue>(key: string, fallback: TValue): Promise<TValue> {
  try {
    const database = await openDatabase();
    return await new Promise<TValue>((resolve, reject) => {
      const transaction = database.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve((request.result as TValue | undefined) ?? fallback);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => database.close();
      transaction.onerror = () => database.close();
    });
  } catch {
    return fallback;
  }
}

async function writeValue<TValue>(key: string, value: TValue): Promise<void> {
  try {
    const database = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(value, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => database.close();
      transaction.onerror = () => database.close();
    });
  } catch (error) {
    console.warn(`IndexedDB write failed for ${key}`, error);
  }
}

async function deleteValue(key: string): Promise<void> {
  try {
    const database = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => database.close();
      transaction.onerror = () => database.close();
    });
  } catch (error) {
    console.warn(`IndexedDB delete failed for ${key}`, error);
  }
}

export const storageService = {
  async loadAssets() {
    return readValue<Asset[]>(keys.assets, []);
  },

  async saveAssets(assets: Asset[]) {
    await writeValue(keys.assets, assets.slice(0, 100));
  },

  async loadParams(fallback: GenerateParams) {
    return readValue<GenerateParams>(keys.params, fallback);
  },

  async saveParams(params: GenerateParams) {
    await writeValue(keys.params, params);
  },

  async loadProjectSettings(fallback: ProjectSettings) {
    return readValue<ProjectSettings>(keys.projectSettings, fallback);
  },

  async saveProjectSettings(settings: ProjectSettings) {
    await writeValue(keys.projectSettings, settings);
  },

  async clearAssets() {
    await deleteValue(keys.assets);
  },

  async clearLegacyLocalStorage() {
    localStorage.removeItem("game-asset-forge.assets");
    localStorage.removeItem("game-asset-forge.params");
    localStorage.removeItem("game-asset-forge.project-settings");
  },
};
