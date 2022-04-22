export interface RvViewConfig {
  methodName: string;
  configValues: RvConfigValues;
  transformers: RvTransformerParams[];
}

export type RvConfigValues = Record<string, any>

export interface RvTransformerParams {
  typing_name: string;
  config_values: RvConfigValues;
}
