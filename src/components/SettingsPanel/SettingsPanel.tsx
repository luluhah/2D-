import { RotateCcw, Save } from "lucide-react";
import { assetSizeOptions, assetStyleOptions } from "../../constants/assetOptions";
import type { AssetSize, AssetStyle, ProjectSettings } from "../../types/asset";
import styles from "./SettingsPanel.module.css";

type SettingsPanelProps = {
  settings: ProjectSettings;
  onChange: (settings: Partial<ProjectSettings>) => void;
  onApplyDefaults: () => void;
  onReset: () => void;
};

export function SettingsPanel({
  settings,
  onChange,
  onApplyDefaults,
  onReset,
}: SettingsPanelProps) {
  return (
    <section className={styles.panel} aria-labelledby="settings-title">
      <div className={styles.header}>
        <div>
          <h2 id="settings-title">项目设置</h2>
          <p>保存项目级默认值，让素材风格更一致。</p>
        </div>
        <button type="button" onClick={onReset} aria-label="恢复默认设置">
          <RotateCcw size={16} />
        </button>
      </div>

      <label className={styles.field}>
        <span>项目名称</span>
        <input
          value={settings.projectName}
          onChange={(event) => onChange({ projectName: event.target.value })}
        />
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>默认风格</span>
          <select
            value={settings.defaultStyle}
            onChange={(event) => onChange({ defaultStyle: event.target.value as AssetStyle })}
          >
            {assetStyleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>默认尺寸</span>
          <select
            value={settings.defaultSize}
            onChange={(event) => onChange({ defaultSize: event.target.value as AssetSize })}
          >
            {assetSizeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={styles.field}>
        <span>命名前缀</span>
        <input
          value={settings.namingPrefix}
          placeholder="例如：jam2026"
          onChange={(event) => onChange({ namingPrefix: event.target.value })}
        />
      </label>

      <button className={styles.applyButton} type="button" onClick={onApplyDefaults}>
        <Save size={16} />
        应用到当前参数
      </button>
    </section>
  );
}
