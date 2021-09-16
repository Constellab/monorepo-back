import {Expose, Type} from 'class-transformer';
import {ClRecordWrapperTransform} from '@monorepo/core-lib';
import {BioxConfigSpecs, BioxConfigSpecTyped} from '../biox-config-spec.entity';
import {BioxTaskData} from '../proccesable/biox-task.entity';
import {BioxProcessableType} from './biox-processable-type.entity';

/**
 * Define the spec of a task
 */
export class BioxTaskType extends BioxProcessableType {

  @Expose({name: 'input_specs'})
  inputSpecs: Record<string, string[]>;

  @Expose({name: 'output_specs'})
  outputSpecs: Record<string, string[]>;

  @Expose({name: 'config_specs'})
  @ClRecordWrapperTransform(BioxConfigSpecs, BioxConfigSpecTyped)
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
