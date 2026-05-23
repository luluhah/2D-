import {
  assetBackgroundOptions,
  assetSizeOptions,
  assetStyleOptions,
  assetTypeOptions,
  generateCountOptions,
  paletteOptions,
} from "../../constants/assetOptions";
import type {
  AssetBackground,
  AssetSize,
  AssetStyle,
  AssetType,
  GenerateCount,
  GenerateParams,
} from "../../types/asset";
import styles from "./ParameterPanel.module.css";

type ParameterPanelProps = {
  params: GenerateParams;
  onChange: (params: Partial<GenerateParams>) => void;
  onReset: () => void;
};

export function ParameterPanel({ params, onChange, onReset }: ParameterPanelProps) {
  return (
    <section className={styles.panel} aria-labelledby="parameter-title">
      <div className={styles.header}>
        <div>
          <h2 id="parameter-title">生成参数</h2>
          <p>用游戏开发常用维度约束素材输出。</p>
        </div>
        <button type="button" onClick={onReset}>
          重置
        </button>
      </div>

      <fieldset className={styles.group}>
        <legend>素材类型</legend>
        <div className={styles.optionGrid}>
          {assetTypeOptions.map((option) => (
            <button
              className={params.type === option.value ? styles.activeOption : styles.option}
              key={option.value}
              type="button"
              onClick={() => onChange({ type: option.value as AssetType })}
            >
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <label className={styles.field}>
        <span>风格</span>
        <select
          value={params.style}
          onChange={(event) => onChange({ style: event.target.value as AssetStyle })}
        >
          {assetStyleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>尺寸</span>
          <select
            value={params.size}
            onChange={(event) => onChange({ size: event.target.value as AssetSize })}
          >
            {assetSizeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>数量</span>
          <select
            value={params.count}
            onChange={(event) => onChange({ count: Number(event.target.value) as GenerateCount })}
          >
            {generateCountOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className={styles.group}>
        <legend>背景</legend>
        <div className={styles.segmented}>
          {assetBackgroundOptions.map((option) => (
            <button
              className={params.background === option.value ? styles.activeSegment : styles.segment}
              key={option.value}
              type="button"
              onClick={() => onChange({ background: option.value as AssetBackground })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>调色板</legend>
        <div className={styles.paletteList}>
          {paletteOptions.map((palette) => (
            <button
              className={params.palette === palette.value ? styles.activePalette : styles.palette}
              key={palette.value}
              type="button"
              onClick={() => onChange({ palette: palette.value })}
              aria-label={`选择${palette.label}调色板`}
            >
              <span style={{ backgroundColor: palette.color }} />
              {palette.label}
            </button>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
