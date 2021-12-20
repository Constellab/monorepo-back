import {Expose, Type} from 'class-transformer';
import {ClRecordWrapperTransform} from '@monorepo/core-lib';
import {LabConfigSpecBase, LabConfigSpecs} from '../lab-config-spec.entity';
import {LabTaskData} from '../process/lab-task.entity';
import {LabProcessType} from './lab-process-type.entity';
import {LabIOSpec} from '../lab-io.entity';

/**
 * Define the spec of a task
 */
export class LabTaskType extends LabProcessType {

  @Expose({name: 'input_specs'})
  inputSpecs: Record<string, LabIOSpec>;

  @Expose({name: 'output_specs'})
  outputSpecs: Record<string, LabIOSpec>;

  @Expose({name: 'config_specs'})
  @ClRecordWrapperTransform(LabConfigSpecs, LabConfigSpecBase)
  configSpecs: LabConfigSpecs;

  @Type(() => LabTaskData)
  data: LabTaskData;

  getConfigSpecs(): LabConfigSpecs {
    return this.configSpecs;
  }

  getInputSpecs(): Record<string, LabIOSpec> {
    return this.inputSpecs;
  }

  getOutputSpecs(): Record<string, LabIOSpec> {
    return this.outputSpecs;
  }


}
