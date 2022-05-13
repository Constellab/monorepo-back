import {TdProcessType} from './td-process-type.entity';
import {Expose} from 'class-transformer';
import {TdConfigTypeDTO, TdIOSpecDTO} from './td-task-type.entity';

/**
 * Define the a task
 */
export class TdProtocolType extends TdProcessType {
  @Expose({name: 'input_specs'})
  inputSpecs?: Record<string, TdIOSpecDTO>;

  @Expose({name: 'output_specs'})
  outputSpecs?: Record<string, TdIOSpecDTO>;

  @Expose({name: 'config_specs'})
  configSpecs?: Record<string, TdConfigTypeDTO>;
}


