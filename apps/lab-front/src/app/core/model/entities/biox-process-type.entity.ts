import {ViewModel} from '../global/view-model.entity';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';
import {ClRecordWrapperTransform} from '@monorepo/core-lib';
import {BioxConfigSpecs, BioxConfigSpecTyped} from './biox-config-spec.entity';
import {LabBaseEntity} from '../global/lab-entity.entity';

export class BioxProcessType extends LabBaseEntity {

  type: 'gws.model.ProcessType';

  base_ptype: 'gws.model.Process';

  ptype: string;

  @Expose({name: 'input_specs'})
  inputSpecs: Record<string, string[]>;

  @Expose({name: 'output_specs'})
  outputSpecs: Record<string, string[]>;

  @Expose({name: 'config_specs'})
  @ClRecordWrapperTransform(BioxConfigSpecs, BioxConfigSpecTyped)
  configSpecs: BioxConfigSpecs;

  data: any;

  hasInputs(): boolean {
    return this.inputSpecs != null && Object.keys(this.inputSpecs).length > 0;
  }

  hasOutputs(): boolean {
    return this.outputSpecs != null && Object.keys(this.outputSpecs).length > 0;
  }

  hasConfigs(): boolean {
    return this.configSpecs.hasConfigs();
  }
}

/**
 * Tree that group the process type by ptype module
 */
export class BioxProcessTypeTree {
  @Expose({name: 'ptype_part'})
  ptypePart: string;

  @Expose({name: 'sub_modules'})
  @Type(() => BioxProcessTypeTree)
  subModules?: BioxProcessTypeTree[];

  @Expose({name: 'process_type'})
  @Type(() => BioxProcessType)
  processType?: BioxProcessType;

  hasChildren(): boolean {
    return this.subModules?.length > 0;
  }

  isLeaf(): boolean {
    return this.processType != null;
  }
}

export type BioxProcessTypeVM = ViewModel<BioxProcessType>;

export type BioxProcessTypeDatasource = FlEntityPaginatedDatasource<BioxProcessType>;
