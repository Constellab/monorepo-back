import {ClRecordWrapperTransform} from '@monorepo/core-lib';
import {BioxConfigSpecBase, BioxConfigSpecs} from '../biox-config-spec.entity';
import {Expose} from 'class-transformer';


export class BioxResourceImportConfig {
  @ClRecordWrapperTransform(BioxConfigSpecs, BioxConfigSpecBase)
  specs: BioxConfigSpecs;

  @Expose({name: 'resource_destination'})
  resourceDestination: string;


  public hasConfig(): boolean {
    return this.specs.hasConfigs();
  }
}
