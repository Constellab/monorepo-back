import {ViewModel} from '../global/view-model.entity';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {BioxNode} from '../global/biox-connection.class';
import {Expose} from 'class-transformer';
import {ClRecordWrapperTransform} from '@monorepo/core-lib';
import {BioxConfigSpecs, BioxConfigSpecTyped} from './biox-config-spec.entity';

export class BioxProcessType extends BioxNode {

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
}

export type BioxProcessTypeVM = ViewModel<BioxProcessType>;

export type BioxProcessTypeDatasource = FlEntityPaginatedDatasource<BioxProcessType>;
