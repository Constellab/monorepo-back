import {TdProcessType} from './td-process-type.entity';
import {Expose} from 'class-transformer';

/**
 * Define the a task
 */
export class TdTaskType extends TdProcessType {
  @Expose({name: 'input_specs'})
  inputSpecs?: Record<string, TdIOSpecDTO>;

  @Expose({name: 'output_specs'})
  outputSpecs?: Record<string, TdIOSpecDTO>;

  @Expose({name: 'config_specs'})
  configSpecs?: Record<string, TdConfigTypeDTO>;
}


export class TdIOSpecDTO {
  resource_types: TdResourceTypeDTO[];

  human_name: string;

  short_description: string;
}

export class TdResourceTypeDTO {
  typing_name: string;

  human_name: string;

  short_description: string;

  brick_version: string;
}

export class TdConfigTypeDTO {
  type?: string;
  optional?: boolean;
  visibility?: string;
  short_description?: string;
  allowed_values?: any[];
  default_value: any;
}
