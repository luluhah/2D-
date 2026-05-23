export type AssetType = "character" | "prop" | "icon" | "tile" | "background" | "ui";

export type AssetStyle =
  | "pixel"
  | "hand-drawn"
  | "cartoon"
  | "low-poly"
  | "dark-fantasy"
  | "sci-fi";

export type AssetSize = "32x32" | "64x64" | "128x128" | "256x256" | "512x512";

export type AssetBackground = "transparent" | "solid" | "scene";

export type GenerateCount = 1 | 2 | 4 | 8;

export type GenerateParams = {
  prompt: string;
  negativePrompt?: string;
  type: AssetType;
  style: AssetStyle;
  size: AssetSize;
  background: AssetBackground;
  palette?: string;
  count: GenerateCount;
};

export type Asset = {
  id: string;
  name: string;
  imageUrl: string;
  prompt: string;
  negativePrompt?: string;
  type: AssetType;
  style: AssetStyle;
  size: AssetSize;
  background: AssetBackground;
  palette?: string;
  favorite: boolean;
  createdAt: number;
};

export type GenerationStatus = "idle" | "validating" | "generating" | "success" | "error";

export type GenerationState = {
  status: GenerationStatus;
  progress: number;
  error?: string;
};

export type ProjectSettings = {
  projectName: string;
  defaultStyle: AssetStyle;
  defaultSize: AssetSize;
  namingPrefix: string;
};
