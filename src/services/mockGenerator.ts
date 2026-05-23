import type { Asset, GenerateParams } from "../types/asset";
import type { AssetGenerator } from "../types/generator";
import { createAssetName } from "./filenameService";

const styleColorMap = {
  pixel: ["#0f8b8d", "#f4b860"],
  "hand-drawn": ["#8a5a44", "#f2cc8f"],
  cartoon: ["#ef476f", "#ffd166"],
  "low-poly": ["#3a86ff", "#06d6a0"],
  "dark-fantasy": ["#2e3542", "#9d4edd"],
  "sci-fi": ["#00b4d8", "#90e0ef"],
};

const typeGlyphMap = {
  character: "C",
  prop: "P",
  icon: "I",
  tile: "T",
  background: "B",
  ui: "U",
};

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function createMockImage(params: GenerateParams, index: number) {
  const [primary, secondary] = styleColorMap[params.style];
  const glyph = typeGlyphMap[params.type];
  const [width, height] = params.size.split("x").map(Number);
  const bgOpacity = params.background === "transparent" ? "0" : "1";
  const tileSize = params.type === "tile" ? 16 : 24;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <pattern id="grid" width="${tileSize}" height="${tileSize}" patternUnits="userSpaceOnUse">
          <rect width="${tileSize}" height="${tileSize}" fill="${secondary}" opacity="0.18"/>
          <path d="M ${tileSize} 0 L 0 0 0 ${tileSize}" fill="none" stroke="${primary}" stroke-width="1" opacity="0.2"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="#f8fafc" opacity="${bgOpacity}"/>
      <rect width="100%" height="100%" fill="url(#grid)" opacity="0.9"/>
      <circle cx="${width * 0.5}" cy="${height * 0.48}" r="${Math.min(width, height) * 0.28}" fill="${primary}" opacity="0.92"/>
      <rect x="${width * 0.28}" y="${height * 0.62}" width="${width * 0.44}" height="${height * 0.16}" rx="4" fill="${secondary}" opacity="0.95"/>
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.max(18, width * 0.24)}" font-weight="700" fill="#ffffff">${glyph}${index + 1}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const mockGenerator: AssetGenerator = {
  async generate(params, options) {
    await delay(900);

    return Array.from({ length: params.count }, (_, index): Asset => ({
      id: crypto.randomUUID(),
      name: createAssetName(params, index, options?.namingPrefix),
      imageUrl: createMockImage(params, index),
      prompt: params.prompt,
      negativePrompt: params.negativePrompt,
      type: params.type,
      style: params.style,
      size: params.size,
      background: params.background,
      palette: params.palette,
      favorite: false,
      createdAt: Date.now() + index,
    }));
  },
};
