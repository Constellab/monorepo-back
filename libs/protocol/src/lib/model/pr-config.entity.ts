import {PrConfigSpecs} from './pr-config-spec.entity';

// todo TO REMOVE
export type PrConfigValues = Record<string, any>


/**
 * Config object for a process
 */
export class PrConfig {

  // object describing the type of the configs and default values
  specs: PrConfigSpecs;

  // actual values of the config
  values: PrConfigValues;

  constructor(specs: PrConfigSpecs, values?: PrConfigValues) {
    this.specs = specs;
    this.values = values;
  }
}



