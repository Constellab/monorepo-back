import {ClRecordWrapperTransform} from '@monorepo/core-lib';
import {LabConfigSpecBase, LabConfigSpecs} from '../lab-config-spec.entity';
import {Expose} from 'class-transformer';


export class LabResourceImportConfig {
  @ClRecordWrapperTransform(LabConfigSpecs, LabConfigSpecBase)
  specs: LabConfigSpecs;

  @Expose({name: 'resource_destination'})
  resourceDestination: string;


  public hasConfig(): boolean {
    return this.specs.hasConfigs();
  }
}
