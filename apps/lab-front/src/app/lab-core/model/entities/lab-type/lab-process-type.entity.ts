import {LabConfigSpecBase, LabConfigSpecs} from '../lab-config-spec.entity';
import {LabTypeEntity} from './lab-type.entity';
import {Expose} from 'class-transformer';
import {ClRecordWrapperTransform} from '@monorepo/core-lib';
import {TdIOSpecDTO} from '@monorepo/technical-doc';

export class LabProcessType extends LabTypeEntity {

  @Expose({name: 'input_specs'})
  inputSpecs: Record<string, TdIOSpecDTO>;

  @Expose({name: 'output_specs'})
  outputSpecs: Record<string, TdIOSpecDTO>;

  @Expose({name: 'config_specs'})
  @ClRecordWrapperTransform(LabConfigSpecs, LabConfigSpecBase)
  configSpecs: LabConfigSpecs;

  @Expose({name: 'additional_info'})
  additionalInfo: {
    // only for importers
    supported_extensions: string[];
  };

  hasConfigSpecs(): boolean {
    const config: LabConfigSpecs = this.configSpecs;
    return config != null && config.hasConfigs();
  }


}
