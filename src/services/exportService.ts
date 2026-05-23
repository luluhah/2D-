import type { Asset } from "../types/asset";
import { getAssetFileName } from "./filenameService";

function triggerDownload(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("PNG 生成失败"));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("图片加载失败"));
    image.src = src;
  });
}

export async function downloadAssetAsPng(asset: Asset) {
  const [width, height] = asset.size.split("x").map(Number);
  const image = await loadImage(asset.imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("当前浏览器不支持 Canvas 导出");
  }

  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const blob = await canvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  triggerDownload(url, getAssetFileName(asset));
  URL.revokeObjectURL(url);
}

export async function downloadAssetsAsPng(assets: Asset[]) {
  for (const asset of assets) {
    await downloadAssetAsPng(asset);
    await new Promise((resolve) => window.setTimeout(resolve, 120));
  }
}

export function exportAssetMetadata(assets: Asset[]) {
  const metadata = assets.map(
    ({ id, name, prompt, negativePrompt, type, style, size, background, palette, createdAt }) => ({
      id,
      name,
      prompt,
      negativePrompt,
      type,
      style,
      size,
      background,
      palette,
      createdAt,
    }),
  );
  const blob = new Blob([JSON.stringify(metadata, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, "game-asset-forge-metadata.json");
  URL.revokeObjectURL(url);
}

export async function exportSpriteSheet(assets: Asset[]) {
  if (assets.length === 0) {
    throw new Error("请选择要导出的素材");
  }

  const size = assets[0].size;
  const hasMixedSize = assets.some((asset) => asset.size !== size);
  if (hasMixedSize) {
    throw new Error("请选择相同尺寸的素材导出 Sprite Sheet");
  }

  const [cellWidth, cellHeight] = size.split("x").map(Number);
  const columns = Math.ceil(Math.sqrt(assets.length));
  const rows = Math.ceil(assets.length / columns);
  const canvas = document.createElement("canvas");
  canvas.width = columns * cellWidth;
  canvas.height = rows * cellHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("当前浏览器不支持 Canvas 导出");
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  const images = await Promise.all(assets.map((asset) => loadImage(asset.imageUrl)));
  images.forEach((image, index) => {
    const x = (index % columns) * cellWidth;
    const y = Math.floor(index / columns) * cellHeight;
    context.drawImage(image, x, y, cellWidth, cellHeight);
  });

  const blob = await canvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `sprite-sheet-${size}-${assets.length}.png`);
  URL.revokeObjectURL(url);
}
