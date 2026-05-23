import type {
  AssetBackground,
  AssetSize,
  AssetStyle,
  AssetType,
  GenerateCount,
} from "../types/asset";

export type SelectOption<TValue extends string | number> = {
  value: TValue;
  label: string;
  description?: string;
};

export const assetTypeOptions: SelectOption<AssetType>[] = [
  { value: "character", label: "角色", description: "主角、敌人、NPC" },
  { value: "prop", label: "道具", description: "武器、箱子、药水" },
  { value: "icon", label: "图标", description: "技能、物品、状态" },
  { value: "tile", label: "地块", description: "地面、墙体、平台" },
  { value: "background", label: "场景", description: "远景、房间、地图" },
  { value: "ui", label: "UI", description: "按钮、面板、徽章" },
];

export const assetStyleOptions: SelectOption<AssetStyle>[] = [
  { value: "pixel", label: "像素风" },
  { value: "hand-drawn", label: "手绘风" },
  { value: "cartoon", label: "卡通风" },
  { value: "low-poly", label: "低多边形" },
  { value: "dark-fantasy", label: "暗黑奇幻" },
  { value: "sci-fi", label: "科幻" },
];

export const assetSizeOptions: SelectOption<AssetSize>[] = [
  { value: "32x32", label: "32x32" },
  { value: "64x64", label: "64x64" },
  { value: "128x128", label: "128x128" },
  { value: "256x256", label: "256x256" },
  { value: "512x512", label: "512x512" },
];

export const assetBackgroundOptions: SelectOption<AssetBackground>[] = [
  { value: "transparent", label: "透明" },
  { value: "solid", label: "纯色" },
  { value: "scene", label: "简单场景" },
];

export const generateCountOptions: SelectOption<GenerateCount>[] = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 4, label: "4" },
  { value: 8, label: "8" },
];

export const paletteOptions = [
  { value: "emerald", label: "翡翠", color: "#0f8b8d" },
  { value: "amber", label: "琥珀", color: "#f4b860" },
  { value: "crimson", label: "绯红", color: "#c2413d" },
  { value: "violet", label: "紫罗兰", color: "#7c4dff" },
  { value: "mono", label: "黑白", color: "#2e3542" },
];
