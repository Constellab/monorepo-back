import {LabBaseEntity} from '../global/lab-entity.entity';
import {ViewModel} from '../global/view-model.entity';
import {FileResource} from './file-resource.entity';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';

export type BioxResource = BioxBasicResource | FileResource;

export class BioxBasicResource extends LabBaseEntity {

  data: Record<string, any>;
}

export type BioxResourceDatasource = FlEntityPaginatedDatasource<LabBaseEntity>

export type BioxResourceVM = ViewModel<BioxResource>;

export class BioxResourceType extends LabBaseEntity {
  base_rtype: 'gws.model.Resource';
  type: 'gws.typing.ResourceType';

  // real type of the resource
  rtype: string;
}

export type BioxResourceTypeDatasource = FlEntityPaginatedDatasource<BioxResourceType>

export const bioxResourceNetworkType: string = 'gena.network.Network';
