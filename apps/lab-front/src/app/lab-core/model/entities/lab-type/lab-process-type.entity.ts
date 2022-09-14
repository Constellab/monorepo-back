import {LabTypeEntity} from './lab-type.entity';
import {Expose} from 'class-transformer';
import {ClRecordWrapperTransform} from '@monorepo/core-lib';
import {TdIOSpec} from '@monorepo/technical-doc';
import {PrConfigSpecs} from '@monorepo/protocol';

export class LabProcessType extends LabTypeEntity {

  @Expose({name: 'input_specs'})
  inputSpecs: Record<string, TdIOSpec>;

  @Expose({name: 'output_specs'})
  outputSpecs: Record<string, TdIOSpec>;

  @Expose({name: 'config_specs'})
  @ClRecordWrapperTransform(PrConfigSpecs)
  configSpecs: PrConfigSpecs;

  @Expose({name: 'additional_info'})
  additionalInfo: {
    // only for importers
    supported_extensions: string[];
  };

  hasConfigSpecs(): boolean {
    const config: PrConfigSpecs = this.configSpecs;
    return config != null && config.hasConfigs();
  }


}
