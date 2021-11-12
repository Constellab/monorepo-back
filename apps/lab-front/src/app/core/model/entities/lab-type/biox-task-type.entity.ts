import {Expose, Type} from 'class-transformer';
import {ClRecordWrapperTransform} from '@monorepo/core-lib';
import {BioxConfigSpecBase, BioxConfigSpecs} from '../biox-config-spec.entity';
import {BioxTaskData} from '../process/biox-task.entity';
import {BioxProcessType} from './biox-process-type.entity';
import {BioxIOSpec} from '../biox-io.entity';

/**
 * Define the spec of a task
 */
export class BioxTaskType extends BioxProcessType {

  @Expose({name: 'input_specs'})
  inputSpecs: Record<string, BioxIOSpec[]>;

  @Expose({name: 'output_specs'})
  outputSpecs: Record<string, BioxIOSpec[]>;

  @Expose({name: 'config_specs'})
  @ClRecordWrapperTransform(BioxConfigSpecs, BioxConfigSpecBase)
  configSpecs: BioxConfigSpecs;

  @Type(() => BioxTaskData)
  data: BioxTaskData;

  getConfigSpecs(): BioxConfigSpecs {
    return this.configSpecs;
  }

  getInputSpecs(): Record<string, BioxIOSpec[]> {
    return this.inputSpecs;
  }

  getOutputSpecs(): Record<string, BioxIOSpec[]> {
    return this.outputSpecs;
  }


}
