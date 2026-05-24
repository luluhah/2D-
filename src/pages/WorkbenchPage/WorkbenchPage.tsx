import { AssetDetailPanel } from "../../components/AssetDetailPanel/AssetDetailPanel";
import { AssetGrid } from "../../components/AssetGrid/AssetGrid";
import { GenerateButton } from "../../components/GenerateButton/GenerateButton";
import { HistoryPanel } from "../../components/HistoryPanel/HistoryPanel";
import { ParameterPanel } from "../../components/ParameterPanel/ParameterPanel";
import { PromptPanel } from "../../components/PromptPanel/PromptPanel";
import { SettingsPanel } from "../../components/SettingsPanel/SettingsPanel";
import { TopBar } from "../../components/TopBar/TopBar";
import { initialProjectSettings, useAssetStore } from "../../hooks/useAssetStore";
import { exportAssetMetadata } from "../../services/exportService";
import styles from "./WorkbenchPage.module.css";

export function WorkbenchPage() {
  const { state, selectedAsset, favoriteCount, checkedAssets, actions } = useAssetStore();

  return (
    <main className={styles.page}>
      <TopBar
        projectName={state.projectSettings.projectName || initialProjectSettings.projectName}
        assetCount={state.assets.length}
        favoriteCount={favoriteCount}
        onExportMetadata={() => exportAssetMetadata(state.assets)}
      />

      <section className={styles.workspace} aria-label="素材生成工作台">
        <aside className={styles.panel}>
          <PromptPanel
            prompt={state.params.prompt}
            negativePrompt={state.params.negativePrompt}
            onPromptChange={(prompt) => actions.updateParams({ prompt })}
            onNegativePromptChange={(negativePrompt) => actions.updateParams({ negativePrompt })}
          />
          <div className={styles.divider} />
          <ParameterPanel
            params={state.params}
            onChange={actions.updateParams}
            onReset={actions.resetParams}
          />
          <GenerateButton
            generation={state.generation}
            disabled={!state.params.prompt.trim()}
            onGenerate={actions.generate}
          />
        </aside>

        <section className={styles.results}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>生成结果</h2>
              <span>
                {state.assets.length} 个素材 · 已选 {state.checkedAssetIds.length} 个
              </span>
            </div>
            <div className={styles.resultActions}>
              <button type="button" onClick={actions.selectAllAssets} disabled={state.assets.length === 0}>
                全选
              </button>
              <button
                type="button"
                onClick={actions.clearCheckedAssets}
                disabled={state.checkedAssetIds.length === 0}
              >
                清空
              </button>
              <button
                type="button"
                onClick={actions.batchDownload}
                disabled={checkedAssets.length === 0}
              >
                下载 PNG
              </button>
              <button
                type="button"
                onClick={actions.exportSelectedSpriteSheet}
                disabled={checkedAssets.length === 0}
              >
                Sprite Sheet
              </button>
            </div>
          </div>
          {state.exportMessage ? <p className={styles.exportMessage}>{state.exportMessage}</p> : null}
          <AssetGrid
            assets={state.assets}
            selectedAssetId={state.selectedAssetId}
            checkedAssetIds={state.checkedAssetIds}
            onSelect={(asset) => actions.selectAsset(asset.id)}
            onToggleChecked={actions.toggleChecked}
            onToggleFavorite={actions.toggleFavorite}
            onDelete={actions.deleteAsset}
          />
        </section>

        <aside className={styles.panel}>
          <AssetDetailPanel asset={selectedAsset} onToggleFavorite={actions.toggleFavorite} />
          <HistoryPanel
            assets={state.assets}
            selectedAssetId={state.selectedAssetId}
            onSelect={actions.selectAsset}
            onRestoreParams={actions.setParams}
            onClear={actions.clearHistory}
          />
          <SettingsPanel
            settings={state.projectSettings}
            onChange={actions.updateProjectSettings}
            onApplyDefaults={actions.applyProjectDefaults}
            onReset={actions.resetProjectSettings}
          />
        </aside>
      </section>
    </main>
  );
}
