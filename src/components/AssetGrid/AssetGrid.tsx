import type { Asset } from "../../types/asset";
import { AssetCard } from "../AssetCard/AssetCard";
import styles from "./AssetGrid.module.css";

type AssetGridProps = {
  assets: Asset[];
  selectedAssetId?: string;
  checkedAssetIds: string[];
  onSelect: (asset: Asset) => void;
  onToggleChecked: (assetId: string) => void;
  onToggleFavorite: (assetId: string) => void;
  onDelete: (assetId: string) => void;
};

export function AssetGrid({
  assets,
  selectedAssetId,
  checkedAssetIds,
  onSelect,
  onToggleChecked,
  onToggleFavorite,
  onDelete,
}: AssetGridProps) {
  if (assets.length === 0) {
    return (
      <div className={styles.emptyState}>
        <strong>还没有素材</strong>
        <span>输入描述并选择参数后，生成结果会出现在这里。</span>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {assets.map((asset) => (
        <AssetCard
          asset={asset}
          key={asset.id}
          selected={asset.id === selectedAssetId}
          checked={checkedAssetIds.includes(asset.id)}
          onSelect={onSelect}
          onToggleChecked={onToggleChecked}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
