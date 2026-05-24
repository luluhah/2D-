import { useEffect, useMemo, useReducer } from "react";
import { downloadAssetsAsPng, exportSpriteSheet } from "../services/exportService";
import { generateAssets } from "../services/generatorService";
import { storageService } from "../services/storageService";
import type { Asset, GenerateParams, GenerationState, ProjectSettings } from "../types/asset";

export const initialParams: GenerateParams = {
  prompt: "",
  negativePrompt: "",
  type: "character",
  style: "pixel",
  size: "128x128",
  background: "transparent",
  palette: "emerald",
  count: 4,
};

export const initialProjectSettings: ProjectSettings = {
  projectName: "2D 游戏素材生成工作台",
  defaultStyle: "pixel",
  defaultSize: "128x128",
  namingPrefix: "asset",
};

type WorkbenchState = {
  params: GenerateParams;
  assets: Asset[];
  projectSettings: ProjectSettings;
  selectedAssetId?: string;
  checkedAssetIds: string[];
  exportMessage?: string;
  generation: GenerationState;
};

type WorkbenchAction =
  | { type: "updateParams"; payload: Partial<GenerateParams> }
  | { type: "setParams"; payload: GenerateParams }
  | { type: "resetParams" }
  | { type: "setGeneration"; payload: GenerationState }
  | { type: "insertAssets"; payload: Asset[] }
  | { type: "selectAsset"; payload?: string }
  | { type: "toggleFavorite"; payload: string }
  | { type: "deleteAsset"; payload: string }
  | { type: "clearAssets" }
  | { type: "toggleChecked"; payload: string }
  | { type: "selectAllAssets" }
  | { type: "clearCheckedAssets" }
  | { type: "setExportMessage"; payload?: string }
  | { type: "updateProjectSettings"; payload: Partial<ProjectSettings> }
  | { type: "resetProjectSettings" }
  | { type: "applyProjectDefaults" }
  | {
      type: "restoreFromStorage";
      payload: {
        assets: Asset[];
        params: GenerateParams;
        projectSettings: ProjectSettings;
      };
    };

function createInitialState(): WorkbenchState {
  return {
    params: initialParams,
    assets: [],
    projectSettings: initialProjectSettings,
    checkedAssetIds: [],
    generation: {
      status: "idle",
      progress: 0,
    },
  };
}

function workbenchReducer(state: WorkbenchState, action: WorkbenchAction): WorkbenchState {
  switch (action.type) {
    case "updateParams":
      return { ...state, params: { ...state.params, ...action.payload } };
    case "setParams":
      return { ...state, params: action.payload };
    case "resetParams":
      return { ...state, params: initialParams };
    case "setGeneration":
      return { ...state, generation: action.payload };
    case "insertAssets":
      return {
        ...state,
        assets: [...action.payload, ...state.assets],
        selectedAssetId: action.payload[0]?.id,
        generation: { status: "success", progress: 100 },
      };
    case "selectAsset":
      return { ...state, selectedAssetId: action.payload };
    case "toggleFavorite":
      return {
        ...state,
        assets: state.assets.map((asset) =>
          asset.id === action.payload ? { ...asset, favorite: !asset.favorite } : asset,
        ),
      };
    case "deleteAsset":
      return {
        ...state,
        assets: state.assets.filter((asset) => asset.id !== action.payload),
        selectedAssetId: state.selectedAssetId === action.payload ? undefined : state.selectedAssetId,
        checkedAssetIds: state.checkedAssetIds.filter((assetId) => assetId !== action.payload),
      };
    case "clearAssets":
      return { ...state, assets: [], selectedAssetId: undefined, checkedAssetIds: [] };
    case "toggleChecked":
      return {
        ...state,
        checkedAssetIds: state.checkedAssetIds.includes(action.payload)
          ? state.checkedAssetIds.filter((assetId) => assetId !== action.payload)
          : [...state.checkedAssetIds, action.payload],
      };
    case "selectAllAssets":
      return { ...state, checkedAssetIds: state.assets.map((asset) => asset.id) };
    case "clearCheckedAssets":
      return { ...state, checkedAssetIds: [] };
    case "setExportMessage":
      return { ...state, exportMessage: action.payload };
    case "updateProjectSettings":
      return { ...state, projectSettings: { ...state.projectSettings, ...action.payload } };
    case "resetProjectSettings":
      return { ...state, projectSettings: initialProjectSettings };
    case "applyProjectDefaults":
      return {
        ...state,
        params: {
          ...state.params,
          style: state.projectSettings.defaultStyle,
          size: state.projectSettings.defaultSize,
        },
      };
    case "restoreFromStorage":
      return {
        ...state,
        assets: action.payload.assets,
        params: action.payload.params,
        projectSettings: action.payload.projectSettings,
      };
    default:
      return state;
  }
}

export function useAssetStore() {
  const [state, dispatch] = useReducer(workbenchReducer, undefined, createInitialState);

  useEffect(() => {
    let cancelled = false;

    async function restoreStorage() {
      await storageService.clearLegacyLocalStorage();
      const [assets, params, projectSettings] = await Promise.all([
        storageService.loadAssets(),
        storageService.loadParams(initialParams),
        storageService.loadProjectSettings(initialProjectSettings),
      ]);

      if (!cancelled) {
        dispatch({
          type: "restoreFromStorage",
          payload: { assets, params, projectSettings },
        });
      }
    }

    void restoreStorage();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedAsset = useMemo(
    () => state.assets.find((asset) => asset.id === state.selectedAssetId),
    [state.assets, state.selectedAssetId],
  );
  const favoriteCount = useMemo(
    () => state.assets.filter((asset) => asset.favorite).length,
    [state.assets],
  );
  const checkedAssets = useMemo(
    () => state.assets.filter((asset) => state.checkedAssetIds.includes(asset.id)),
    [state.assets, state.checkedAssetIds],
  );

  useEffect(() => {
    storageService.saveAssets(state.assets);
  }, [state.assets]);

  useEffect(() => {
    storageService.saveParams(state.params);
  }, [state.params]);

  useEffect(() => {
    storageService.saveProjectSettings(state.projectSettings);
  }, [state.projectSettings]);

  const generate = async () => {
    if (!state.params.prompt.trim()) {
      dispatch({
        type: "setGeneration",
        payload: { status: "error", progress: 0, error: "请输入素材描述" },
      });
      return;
    }

    dispatch({ type: "setGeneration", payload: { status: "generating", progress: 24 } });

    try {
      const nextAssets = await generateAssets(state.params, {
        namingPrefix: state.projectSettings.namingPrefix,
      });
      dispatch({ type: "insertAssets", payload: nextAssets });
    } catch (error) {
      dispatch({
        type: "setGeneration",
        payload: {
          status: "error",
          progress: 0,
          error: error instanceof Error ? error.message : "生成失败，请稍后重试",
        },
      });
    }
  };

  const clearHistory = () => {
    dispatch({ type: "clearAssets" });
    void storageService.clearAssets();
  };

  const batchDownload = async () => {
    try {
      await downloadAssetsAsPng(checkedAssets);
      dispatch({
        type: "setExportMessage",
        payload: `已开始下载 ${checkedAssets.length} 个 PNG`,
      });
    } catch {
      dispatch({ type: "setExportMessage", payload: "批量下载失败，请稍后重试" });
    }
  };

  const exportSelectedSpriteSheet = async () => {
    try {
      await exportSpriteSheet(checkedAssets);
      dispatch({ type: "setExportMessage", payload: "Sprite Sheet 已导出" });
    } catch (error) {
      dispatch({
        type: "setExportMessage",
        payload: error instanceof Error ? error.message : "Sprite Sheet 导出失败",
      });
    }
  };

  return {
    state,
    selectedAsset,
    favoriteCount,
    checkedAssets,
    actions: {
      updateParams: (params: Partial<GenerateParams>) =>
        dispatch({ type: "updateParams", payload: params }),
      setParams: (params: GenerateParams) => dispatch({ type: "setParams", payload: params }),
      resetParams: () => dispatch({ type: "resetParams" }),
      selectAsset: (assetId?: string) => dispatch({ type: "selectAsset", payload: assetId }),
      toggleFavorite: (assetId: string) => dispatch({ type: "toggleFavorite", payload: assetId }),
      deleteAsset: (assetId: string) => dispatch({ type: "deleteAsset", payload: assetId }),
      clearHistory,
      toggleChecked: (assetId: string) => dispatch({ type: "toggleChecked", payload: assetId }),
      selectAllAssets: () => dispatch({ type: "selectAllAssets" }),
      clearCheckedAssets: () => dispatch({ type: "clearCheckedAssets" }),
      updateProjectSettings: (settings: Partial<ProjectSettings>) =>
        dispatch({ type: "updateProjectSettings", payload: settings }),
      resetProjectSettings: () => dispatch({ type: "resetProjectSettings" }),
      applyProjectDefaults: () => dispatch({ type: "applyProjectDefaults" }),
      generate,
      batchDownload,
      exportSelectedSpriteSheet,
    },
  };
}
