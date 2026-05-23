import { Download, FolderKanban } from "lucide-react";
import styles from "./TopBar.module.css";

type TopBarProps = {
  projectName: string;
  assetCount: number;
  favoriteCount: number;
  onExportMetadata: () => void;
};

export function TopBar({ projectName, assetCount, favoriteCount, onExportMetadata }: TopBarProps) {
  return (
    <header className={styles.topBar}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          <FolderKanban size={20} />
        </span>
        <div>
          <p>Game Asset Forge</p>
          <h1>{projectName}</h1>
        </div>
      </div>

      <div className={styles.actions}>
        <div className={styles.stats} aria-label="素材统计">
          <span>{assetCount} 个素材</span>
          <span>{favoriteCount} 个收藏</span>
        </div>
        <button type="button" onClick={onExportMetadata} disabled={assetCount === 0}>
          <Download size={16} />
          导出 JSON
        </button>
      </div>
    </header>
  );
}
