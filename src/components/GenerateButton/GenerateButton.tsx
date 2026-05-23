import { WandSparkles } from "lucide-react";
import type { GenerationState } from "../../types/asset";
import styles from "./GenerateButton.module.css";

type GenerateButtonProps = {
  generation: GenerationState;
  disabled?: boolean;
  onGenerate: () => void;
};

export function GenerateButton({ generation, disabled = false, onGenerate }: GenerateButtonProps) {
  const isGenerating = generation.status === "generating";
  const buttonLabel =
    generation.status === "error" ? "重试生成" : isGenerating ? "生成中" : "生成素材";

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.button}
        type="button"
        disabled={disabled || isGenerating}
        onClick={onGenerate}
      >
        <WandSparkles size={18} />
        {buttonLabel}
      </button>

      {generation.status === "generating" ? (
        <div className={styles.progress} aria-label="生成进度">
          <span style={{ width: `${generation.progress}%` }} />
        </div>
      ) : null}

      {generation.error ? <p className={styles.error}>{generation.error}</p> : null}
    </div>
  );
}
