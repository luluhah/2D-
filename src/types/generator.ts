import type { Asset, GenerateParams } from "./asset";

export type GenerateOptions = {
  namingPrefix?: string;
};

export type AssetGenerator = {
  generate(params: GenerateParams, options?: GenerateOptions): Promise<Asset[]>;
};
