import { RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { assetTypeOptions } from "../../constants/assetOptions";
import type { Asset, AssetType, GenerateParams } from "../../types/asset";
import styles from "./HistoryPanel.module.css";

type HistoryPanelProps = {
  assets: Asset[];
  selectedAssetId?: string;
  onSelect: (assetId: string) => void;
  onRestoreParams: (params: GenerateParams) => void;
  onClear: () => void;
};

const allTypeOption = { value: "all", label: "全部" };

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function toGenerateParams(asset: Asset): GenerateParams {
  return {
    prompt: asset.prompt,
    negativePrompt: asset.negativePrompt,
    type: asset.type,
    style: asset.style,
    size: asset.size,
    background: asset.background,
    palette: asset.palette,
    count: 4,
  };
}

export function HistoryPanel({
  assets,
  selectedAssetId,
  onSelect,
  onRestoreParams,
  onClear,
}: HistoryPanelProps) {
  const [typeFilter, setTypeFilter] = useState<AssetType | "all">("all");
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  const filteredAssets = assets.filter((asset) => {
    const typeMatched = typeFilter === "all" || asset.type === typeFilter;
    const favoriteMatched = !favoriteOnly || asset.favorite;
    return typeMatched && favoriteMatched;
  });

  return (
    <section className={styles.panel} aria-labelledby="history-title">
      <div className={styles.header}>
        <div>
          <h2 id="history-title">历史记录</h2>
          <p>{filteredAssets.length} 条匹配结果</p>
        </div>
        <button type="button" onClick={onClear} disabled={assets.length === 0} aria-label="清空历史">
          <Trash2 size={16} />
        </button>
      </div>

      <div className={styles.filters}>
        <label>
          <span>类型</span>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as AssetType | "all")}
          >
            <option value={allTypeOption.value}>{allTypeOption.label}</option>
            {assetTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.favoriteToggle}>
          <input
            type="checkbox"
            checked={favoriteOnly}
            onChange={(event) => setFavoriteOnly(event.target.checked)}
          />
          只看收藏
        </label>
      </div>

      {filteredAssets.length === 0 ? (
        <div className={styles.empty}>暂无匹配素材</div>
      ) : (
        <div className={styles.list}>
          {filteredAssets.map((asset) => (
            <article
              className={asset.id === selectedAssetId ? styles.activeItem : styles.item}
              key={asset.id}
            >
              <button className={styles.itemMain} type="button" onClick={() => onSelect(asset.id)}>
                <img src={asset.imageUrl} alt="" />
                <span>
                  <strong>{asset.name}</strong>
                  <small>
                    {asset.type} · {asset.size} · {formatTime(asset.createdAt)}
                  </small>
                </span>
              </button>
              <button
                className={styles.restoreButton}
                type="button"
                onClick={() => onRestoreParams(toGenerateParams(asset))}
                aria-label="恢复这条记录的生成参数"
              >
                <RotateCcw size={15} />
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
