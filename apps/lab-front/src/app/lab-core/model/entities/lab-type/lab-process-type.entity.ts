import {LabConfigSpecBase, LabConfigSpecs} from '../lab-config-spec.entity';
import {LabTypeEntity} from './lab-type.entity';
import {LabIOSpec} from '../lab-io.entity';
import {Expose} from 'class-transformer';
import {ClRecordWrapperTransform} from '@monorepo/core-lib';


export class LabProcessType extends LabTypeEntity {

  @Expose({name: 'input_specs'})
  inputSpecs: Record<string, LabIOSpec>;

  @Expose({name: 'output_specs'})
  outputSpecs: Record<string, LabIOSpec>;

  @Expose({name: 'config_specs'})
  @ClRecordWrapperTransform(LabConfigSpecs, LabConfigSpecBase)

  configSpecs: LabConfigSpecs;

  hasInputSpecs(): boolean {
    const inputSpecs: Record<string, LabIOSpec> = this.inputSpecs;
    return inputSpecs != null && Object.keys(inputSpecs).length > 0;
  }

  hasOutputSpecs(): boolean {
    const outputSpecs: Record<string, LabIOSpec> = this.outputSpecs;
    return outputSpecs != null && Object.keys(outputSpecs).length > 0;
  }

  hasConfigSpecs(): boolean {
    const config: LabConfigSpecs = this.configSpecs;
    return config != null && config.hasConfigs();
  }

}
