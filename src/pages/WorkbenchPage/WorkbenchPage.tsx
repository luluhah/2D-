import { useEffect, useMemo, useState } from "react";
import { AssetDetailPanel } from "../../components/AssetDetailPanel/AssetDetailPanel";
import { AssetGrid } from "../../components/AssetGrid/AssetGrid";
import { GenerateButton } from "../../components/GenerateButton/GenerateButton";
import { HistoryPanel } from "../../components/HistoryPanel/HistoryPanel";
import { ParameterPanel } from "../../components/ParameterPanel/ParameterPanel";
import { PromptPanel } from "../../components/PromptPanel/PromptPanel";
import { SettingsPanel } from "../../components/SettingsPanel/SettingsPanel";
import { TopBar } from "../../components/TopBar/TopBar";
import {
  downloadAssetsAsPng,
  exportAssetMetadata,
  exportSpriteSheet,
} from "../../services/exportService";
import { generateAssets } from "../../services/generatorService";
import { storageService } from "../../services/storageService";
import type { Asset, GenerateParams, GenerationState, ProjectSettings } from "../../types/asset";
import styles from "./WorkbenchPage.module.css";

const initialParams: GenerateParams = {
  prompt: "",
  negativePrompt: "",
  type: "character",
  style: "pixel",
  size: "128x128",
  background: "transparent",
  palette: "emerald",
  count: 4,
};

const initialProjectSettings: ProjectSettings = {
  projectName: "2D 游戏素材生成工作台",
  defaultStyle: "pixel",
  defaultSize: "128x128",
  namingPrefix: "asset",
};

export function WorkbenchPage() {
  const [params, setParams] = useState<GenerateParams>(() => storageService.loadParams(initialParams));
  const [assets, setAssets] = useState<Asset[]>(() => storageService.loadAssets());
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>(() =>
    storageService.loadProjectSettings(initialProjectSettings),
  );
  const [selectedAssetId, setSelectedAssetId] = useState<string>();
  const [checkedAssetIds, setCheckedAssetIds] = useState<string[]>([]);
  const [exportMessage, setExportMessage] = useState<string>();
  const [generation, setGeneration] = useState<GenerationState>({
    status: "idle",
    progress: 0,
  });

  const updateParams = (nextParams: Partial<GenerateParams>) => {
    setParams((currentParams) => ({ ...currentParams, ...nextParams }));
  };

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === selectedAssetId),
    [assets, selectedAssetId],
  );
  const favoriteCount = useMemo(() => assets.filter((asset) => asset.favorite).length, [assets]);
  const checkedAssets = useMemo(
    () => assets.filter((asset) => checkedAssetIds.includes(asset.id)),
    [assets, checkedAssetIds],
  );

  useEffect(() => {
    storageService.saveAssets(assets);
  }, [assets]);

  useEffect(() => {
    storageService.saveParams(params);
  }, [params]);

  useEffect(() => {
    storageService.saveProjectSettings(projectSettings);
  }, [projectSettings]);

  const handleGenerate = async () => {
    if (!params.prompt.trim()) {
      setGeneration({
        status: "error",
        progress: 0,
        error: "请输入素材描述",
      });
      return;
    }

    setGeneration({ status: "generating", progress: 24 });

    try {
      const nextAssets = await generateAssets(params, {
        namingPrefix: projectSettings.namingPrefix,
      });
      setAssets((currentAssets) => [...nextAssets, ...currentAssets]);
      setSelectedAssetId(nextAssets[0]?.id);
      setGeneration({ status: "success", progress: 100 });
    } catch (error) {
      setGeneration({
        status: "error",
        progress: 0,
        error: error instanceof Error ? error.message : "生成失败，请稍后重试",
      });
    }
  };

  const toggleFavorite = (assetId: string) => {
    setAssets((currentAssets) =>
      currentAssets.map((asset) =>
        asset.id === assetId ? { ...asset, favorite: !asset.favorite } : asset,
      ),
    );
  };

  const deleteAsset = (assetId: string) => {
    setAssets((currentAssets) => currentAssets.filter((asset) => asset.id !== assetId));
    setSelectedAssetId((currentId) => (currentId === assetId ? undefined : currentId));
    setCheckedAssetIds((currentIds) => currentIds.filter((currentId) => currentId !== assetId));
  };

  const clearHistory = () => {
    setAssets([]);
    setSelectedAssetId(undefined);
    setCheckedAssetIds([]);
    storageService.clearAssets();
  };

  const toggleChecked = (assetId: string) => {
    setCheckedAssetIds((currentIds) =>
      currentIds.includes(assetId)
        ? currentIds.filter((currentId) => currentId !== assetId)
        : [...currentIds, assetId],
    );
  };

  const selectAllAssets = () => {
    setCheckedAssetIds(assets.map((asset) => asset.id));
  };

  const clearCheckedAssets = () => {
    setCheckedAssetIds([]);
  };

  const updateProjectSettings = (nextSettings: Partial<ProjectSettings>) => {
    setProjectSettings((currentSettings) => ({ ...currentSettings, ...nextSettings }));
  };

  const applyProjectDefaults = () => {
    setParams((currentParams) => ({
      ...currentParams,
      style: projectSettings.defaultStyle,
      size: projectSettings.defaultSize,
    }));
  };

  const resetProjectSettings = () => {
    setProjectSettings(initialProjectSettings);
  };

  const handleBatchDownload = async () => {
    try {
      await downloadAssetsAsPng(checkedAssets);
      setExportMessage(`已开始下载 ${checkedAssets.length} 个 PNG`);
    } catch {
      setExportMessage("批量下载失败，请稍后重试");
    }
  };

  const handleSpriteSheetExport = async () => {
    try {
      await exportSpriteSheet(checkedAssets);
      setExportMessage("Sprite Sheet 已导出");
    } catch (error) {
      setExportMessage(error instanceof Error ? error.message : "Sprite Sheet 导出失败");
    }
  };

  return (
    <main className={styles.page}>
      <TopBar
        projectName={projectSettings.projectName || initialProjectSettings.projectName}
        assetCount={assets.length}
        favoriteCount={favoriteCount}
        onExportMetadata={() => exportAssetMetadata(assets)}
      />

      <section className={styles.workspace} aria-label="素材生成工作台">
        <aside className={styles.panel}>
          <PromptPanel
            prompt={params.prompt}
            negativePrompt={params.negativePrompt}
            onPromptChange={(prompt) => updateParams({ prompt })}
            onNegativePromptChange={(negativePrompt) => updateParams({ negativePrompt })}
          />
          <div className={styles.divider} />
          <ParameterPanel
            params={params}
            onChange={updateParams}
            onReset={() => setParams(initialParams)}
          />
          <GenerateButton
            generation={generation}
            disabled={!params.prompt.trim()}
            onGenerate={handleGenerate}
          />
        </aside>

        <section className={styles.results}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>生成结果</h2>
              <span>
                {assets.length} 个素材 · 已选 {checkedAssetIds.length} 个
              </span>
            </div>
            <div className={styles.resultActions}>
              <button type="button" onClick={selectAllAssets} disabled={assets.length === 0}>
                全选
              </button>
              <button type="button" onClick={clearCheckedAssets} disabled={checkedAssetIds.length === 0}>
                清空
              </button>
              <button
                type="button"
                onClick={handleBatchDownload}
                disabled={checkedAssets.length === 0}
              >
                下载 PNG
              </button>
              <button
                type="button"
                onClick={handleSpriteSheetExport}
                disabled={checkedAssets.length === 0}
              >
                Sprite Sheet
              </button>
            </div>
          </div>
          {exportMessage ? <p className={styles.exportMessage}>{exportMessage}</p> : null}
          <AssetGrid
            assets={assets}
            selectedAssetId={selectedAssetId}
            checkedAssetIds={checkedAssetIds}
            onSelect={(asset) => setSelectedAssetId(asset.id)}
            onToggleChecked={toggleChecked}
            onToggleFavorite={toggleFavorite}
            onDelete={deleteAsset}
          />
        </section>

        <aside className={styles.panel}>
          <AssetDetailPanel asset={selectedAsset} onToggleFavorite={toggleFavorite} />
          <HistoryPanel
            assets={assets}
            selectedAssetId={selectedAssetId}
            onSelect={setSelectedAssetId}
            onRestoreParams={setParams}
            onClear={clearHistory}
          />
          <SettingsPanel
            settings={projectSettings}
            onChange={updateProjectSettings}
            onApplyDefaults={applyProjectDefaults}
            onReset={resetProjectSettings}
          />
        </aside>
      </section>
    </main>
  );
}
