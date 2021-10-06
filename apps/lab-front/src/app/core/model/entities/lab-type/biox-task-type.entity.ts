import {Expose, Type} from 'class-transformer';
import {ClRecordWrapperTransform} from '@monorepo/core-lib';
import {BioxConfigSpecBase, BioxConfigSpecs} from '../biox-config-spec.entity';
import {BioxTaskData} from '../process/biox-task.entity';
import {BioxProcessType} from './biox-process-type.entity';

/**
 * Define the spec of a task
 */
export class BioxTaskType extends BioxProcessType {

  @Expose({name: 'input_specs'})
  inputSpecs: Record<string, string[]>;

  @Expose({name: 'output_specs'})
  outputSpecs: Record<string, string[]>;

  @Expose({name: 'config_specs'})
  @ClRecordWrapperTransform(BioxConfigSpecs, BioxConfigSpecBase)
  configSpecs: BioxConfigSpecs;

  @Type(() => BioxTaskData)
  data: BioxTaskData;

  getConfigSpecs(): BioxConfigSpecs {
    return this.configSpecs;
  }

  getInputSpecs(): Record<string, string[]> {
    return this.inputSpecs;
  }

  getOutputSpecs(): Record<string, string[]> {
    return this.outputSpecs;
  }


}
