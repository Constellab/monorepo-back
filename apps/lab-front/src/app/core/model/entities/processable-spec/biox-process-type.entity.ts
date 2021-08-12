import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';
import {ClRecordWrapperTransform} from '@monorepo/core-lib';
import {BioxConfigSpecs, BioxConfigSpecTyped} from '../biox-config-spec.entity';
import {TypedTree} from '../../global/tree-by-type.class';
import {BioxProcessData} from '../proccesable/biox-process.entity';
import {BioxProcessableType} from './biox-processable-spec.entity';

/**
 * Define the spec of process
 */
export class BioxProcessType extends BioxProcessableType {

  @Expose({name: 'input_specs'})
  inputSpecs: Record<string, string[]>;

  @Expose({name: 'output_specs'})
  outputSpecs: Record<string, string[]>;

  @Expose({name: 'config_specs'})
  @ClRecordWrapperTransform(BioxConfigSpecs, BioxConfigSpecTyped)
  configSpecs: BioxConfigSpecs;

  @Type(() => BioxProcessData)
  data: BioxProcessData;

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

/**
 * Tree that group the process type by model types
 */
export type BioxProcessTypeTree = TypedTree<BioxProcessType>;


export type BioxProcessTypeDatasource = FlEntityPaginatedDatasource<BioxProcessType>;
