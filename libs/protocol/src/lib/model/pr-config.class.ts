import {PrConfigSpecs} from './pr-config-spec.entity';

export type PrConfigValues = Record<string, any>


/**
 * Config object for a process
 */
export interface PrConfig {

  // object describing the type of the configs and default values
  specs: PrConfigSpecs;

  // actual values of the config
  values: PrConfigValues;
}



