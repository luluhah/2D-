import { Heart, Trash2 } from "lucide-react";
import type { Asset } from "../../types/asset";
import styles from "./AssetCard.module.css";

type AssetCardProps = {
  asset: Asset;
  selected: boolean;
  checked: boolean;
  onSelect: (asset: Asset) => void;
  onToggleChecked: (assetId: string) => void;
  onToggleFavorite: (assetId: string) => void;
  onDelete: (assetId: string) => void;
};

export function AssetCard({
  asset,
  selected,
  checked,
  onSelect,
  onToggleChecked,
  onToggleFavorite,
  onDelete,
}: AssetCardProps) {
  return (
    <article className={selected ? styles.selectedCard : styles.card}>
      <label className={styles.checkControl}>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggleChecked(asset.id)}
          aria-label={`选择素材 ${asset.name}`}
        />
      </label>
      <button className={styles.previewButton} type="button" onClick={() => onSelect(asset)}>
        <img src={asset.imageUrl} alt={asset.name} />
      </button>
      <div className={styles.meta}>
        <strong>{asset.name}</strong>
        <span>
          {asset.type} · {asset.style} · {asset.size}
        </span>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => onToggleFavorite(asset.id)}
          aria-label={asset.favorite ? "取消收藏素材" : "收藏素材"}
        >
          <Heart size={16} fill={asset.favorite ? "currentColor" : "none"} />
        </button>
        <button type="button" onClick={() => onDelete(asset.id)} aria-label="删除素材">
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}
