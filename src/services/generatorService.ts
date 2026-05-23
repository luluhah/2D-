import type { GenerateParams } from "../types/asset";
import type { GenerateOptions } from "../types/generator";
import type { AssetGenerator } from "../types/generator";
import { mockGenerator } from "./mockGenerator";

const apiGenerator: AssetGenerator = {
  async generate(params, options) {
    const response = await fetch("/api/generate-assets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ params, options }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || "真实图片生成失败");
    }

    return payload.assets;
  },
};

export async function generateAssets(params: GenerateParams, options?: GenerateOptions) {
  if (import.meta.env.VITE_GENERATOR_MODE === "aliyun") {
    return apiGenerator.generate(params, options);
  }

  return mockGenerator.generate(params, options);
}
