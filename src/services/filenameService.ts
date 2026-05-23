import type { Asset, GenerateParams } from "../types/asset";

const typeNameMap = {
  character: "character",
  prop: "prop",
  icon: "icon",
  tile: "tile",
  background: "background",
  ui: "ui",
};

export function createAssetName(params: GenerateParams, index: number, prefix = "asset") {
  const timestamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const safePrefix = prefix.trim().replaceAll(/\s+/g, "-").toLowerCase() || "asset";
  return `${safePrefix}_${typeNameMap[params.type]}_${params.style}_${params.size}_${timestamp}_${index + 1}`;
}

export function getAssetFileName(asset: Asset) {
  return `${asset.name}.png`;
}
