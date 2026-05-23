import { Sparkles, Trash2 } from "lucide-react";
import { promptExamples } from "../../constants/promptExamples";
import styles from "./PromptPanel.module.css";

type PromptPanelProps = {
  prompt: string;
  negativePrompt?: string;
  onPromptChange: (value: string) => void;
  onNegativePromptChange: (value: string) => void;
};

const maxPromptLength = 300;

export function PromptPanel({
  prompt,
  negativePrompt = "",
  onPromptChange,
  onNegativePromptChange,
}: PromptPanelProps) {
  const fillRandomPrompt = () => {
    const nextPrompt = promptExamples[Math.floor(Math.random() * promptExamples.length)];
    onPromptChange(nextPrompt);
  };

  return (
    <section className={styles.panel} aria-labelledby="prompt-title">
      <div className={styles.header}>
        <div>
          <h2 id="prompt-title">素材描述</h2>
          <p>描述你想生成的游戏素材。</p>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={fillRandomPrompt} aria-label="填入随机示例">
            <Sparkles size={16} />
          </button>
          <button type="button" onClick={() => onPromptChange("")} aria-label="清空素材描述">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <label className={styles.field}>
        <span>Prompt</span>
        <textarea
          value={prompt}
          maxLength={maxPromptLength}
          placeholder="例如：像素风火焰法师，透明背景，适合横版动作游戏"
          onChange={(event) => onPromptChange(event.target.value)}
        />
      </label>
      <span className={styles.counter}>
        {prompt.length}/{maxPromptLength}
      </span>

      <label className={styles.field}>
        <span>负向提示词</span>
        <input
          value={negativePrompt}
          placeholder="例如：模糊、低清晰度、文字、水印"
          onChange={(event) => onNegativePromptChange(event.target.value)}
        />
      </label>
    </section>
  );
}
