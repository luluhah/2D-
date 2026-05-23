import type { Asset, GenerateParams, ProjectSettings } from "../types/asset";

const STORAGE_KEYS = {
  assets: "game-asset-forge.assets",
  params: "game-asset-forge.params",
  projectSettings: "game-asset-forge.project-settings",
};

function readJson<TValue>(key: string, fallback: TValue): TValue {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as TValue) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<TValue>(key: string, value: TValue) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.warn(`localStorage quota exceeded for ${key}`);
      return;
    }

    throw error;
  }
}

function toPersistableAsset(asset: Asset): Asset | undefined {
  if (asset.imageUrl.startsWith("data:")) {
    return undefined;
  }

  return asset;
}

export const storageService = {
  loadAssets() {
    return readJson<Asset[]>(STORAGE_KEYS.assets, []).filter(
      (asset) => !asset.imageUrl.startsWith("data:"),
    );
  },

  saveAssets(assets: Asset[]) {
    const persistableAssets = assets.flatMap((asset) => {
      const persistableAsset = toPersistableAsset(asset);
      return persistableAsset ? [persistableAsset] : [];
    });
    writeJson(STORAGE_KEYS.assets, persistableAssets.slice(0, 30));
  },

  loadParams(fallback: GenerateParams) {
    return readJson<GenerateParams>(STORAGE_KEYS.params, fallback);
  },

  saveParams(params: GenerateParams) {
    writeJson(STORAGE_KEYS.params, params);
  },

  loadProjectSettings(fallback: ProjectSettings) {
    return readJson<ProjectSettings>(STORAGE_KEYS.projectSettings, fallback);
  },

  saveProjectSettings(settings: ProjectSettings) {
    writeJson(STORAGE_KEYS.projectSettings, settings);
  },

  clearAssets() {
    localStorage.removeItem(STORAGE_KEYS.assets);
  },
};
