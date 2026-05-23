import { Copy, Download, Heart } from "lucide-react";
import type { Asset } from "../../types/asset";
import { downloadAssetAsPng } from "../../services/exportService";
import { getAssetFileName } from "../../services/filenameService";
import styles from "./AssetDetailPanel.module.css";

type AssetDetailPanelProps = {
  asset?: Asset;
  onToggleFavorite: (assetId: string) => void;
};

export function AssetDetailPanel({ asset, onToggleFavorite }: AssetDetailPanelProps) {
  if (!asset) {
    return (
      <section className={styles.empty}>
        <h2>详情与历史</h2>
        <p>选中一张素材后，可以查看参数、复制 Prompt 并下载 PNG。</p>
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-labelledby="asset-detail-title">
      <div className={styles.header}>
        <div>
          <h2 id="asset-detail-title">素材详情</h2>
          <p>{asset.name}</p>
        </div>
        <button
          type="button"
          onClick={() => onToggleFavorite(asset.id)}
          aria-label={asset.favorite ? "取消收藏素材" : "收藏素材"}
        >
          <Heart size={17} fill={asset.favorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className={styles.preview}>
        <img src={asset.imageUrl} alt={asset.name} />
      </div>

      <dl className={styles.metaList}>
        <div>
          <dt>类型</dt>
          <dd>{asset.type}</dd>
        </div>
        <div>
          <dt>风格</dt>
          <dd>{asset.style}</dd>
        </div>
        <div>
          <dt>尺寸</dt>
          <dd>{asset.size}</dd>
        </div>
        <div>
          <dt>背景</dt>
          <dd>{asset.background}</dd>
        </div>
      </dl>

      <div className={styles.promptBlock}>
        <span>文件名</span>
        <p>{getAssetFileName(asset)}</p>
      </div>

      {asset.negativePrompt ? (
        <div className={styles.promptBlock}>
          <span>负向提示词</span>
          <p>{asset.negativePrompt}</p>
        </div>
      ) : null}

      <div className={styles.actions}>
        <button type="button" onClick={() => navigator.clipboard.writeText(asset.prompt)}>
          <Copy size={16} />
          复制 Prompt
        </button>
        <button type="button" onClick={() => navigator.clipboard.writeText(getAssetFileName(asset))}>
          <Copy size={16} />
          复制文件名
        </button>
        <button type="button" onClick={() => downloadAssetAsPng(asset)}>
          <Download size={16} />
          下载 PNG
        </button>
      </div>
    </section>
  );
}
