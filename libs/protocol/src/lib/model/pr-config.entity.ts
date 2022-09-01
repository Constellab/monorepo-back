import {TdConfigSpecVisibility} from '@monorepo/technical-doc';
import {PrConfigSpecs} from './pr-config-spec.entity';

export type PrConfigValues = Record<string, any>


/**
 * Config object for a process
 */
export class PrConfigData {

  // object describing the type of the configs and default values
  specs: PrConfigSpecs;

  // actual values of the config
  values: PrConfigValues;

  /**
   * Create a ConfigData with defined specs and empty params
   * if the values are not provided, use the default config
   */
  public static fromSpecs(specs: PrConfigSpecs, values?: PrConfigValues): PrConfigData {
    const config = new PrConfigData();
    config.specs = specs;
    config.values = values ?? specs.getDefaultConfig();
    return config;
  }

  public hasConfig(visibility?: TdConfigSpecVisibility): boolean {
    return this.specs.hasConfigs(visibility);
  }

  public updateValues(config: PrConfigValues): void {
    this.values = config;
  }
}


/**
 * Config object for a process
 */
export class PrConfig {

  // object containing the current configuration values
  data: PrConfigData;

  public updateConfig(config: PrConfigValues): void {
    this.data.updateValues(config);
  }
}



