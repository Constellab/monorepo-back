import {ViewModel} from '../global/view-model.entity';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';
import {ClRecordWrapperTransform} from '@monorepo/core-lib';
import {BioxConfigSpecs, BioxConfigSpecTyped} from './biox-config-spec.entity';
import {LabBaseEntity} from '../global/lab-entity.entity';
import {TypedTree} from '../global/tree-by-type.class';

export class BioxProcessTypeData {
  title: string;

  description?: string;

  doc?: string;
}


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

  @Type(() => BioxProcessTypeData)
  data: BioxProcessTypeData;

  hasInputs(): boolean {
    return this.inputSpecs != null && Object.keys(this.inputSpecs).length > 0;
  }

  hasOutputs(): boolean {
    return this.outputSpecs != null && Object.keys(this.outputSpecs).length > 0;
  }

  hasConfigs(): boolean {
    return this.configSpecs.hasConfigs();
  }

  hasDocumentation(): boolean {
    return this.data.doc != null;
  }
}

/**
 * Tree that group the process type by ptype module
 */
export type BioxProcessTypedTree = TypedTree<BioxProcessType>;

export type BioxProcessTypeVM = ViewModel<BioxProcessType>;

export type BioxProcessTypeDatasource = FlEntityPaginatedDatasource<BioxProcessType>;
