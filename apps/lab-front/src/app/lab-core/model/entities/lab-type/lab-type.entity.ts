import {LabBaseEntity} from '../../global/lab-entity.entity';
import {Expose} from 'class-transformer';
import {FlDatasourcePaginated} from '@monorepo/front-core-lib';

export type LabTypeObjectType = 'TASK' | 'RESOURCE' | 'PROTOCOL' | 'MODEL';

export type LabTypeObjectSubType = 'TASK' | 'PROTOCOL' | 'TRANSFORMER' | 'IMPORTER' | 'EXPORTER';

export type LabTypeObjectStatus = 'SUCCESS' | 'TYPE_UNAVAILABLE';

export class LabTypeEntity extends LabBaseEntity {
  @Expose({name: 'object_type'})
  objectType: LabTypeObjectType;

  @Expose({name: 'typing_name'})
  typingName: string;

  @Expose({name: 'model_name'})
  modelName: string;

  @Expose({name: 'human_name'})
  humanName: string;

  @Expose({name: 'short_description'})
  shortDescription?: string;

  @Expose({name: 'object_sub_type'})
  objectSubType: LabTypeObjectSubType;

  @Expose({name: 'deprecated_since'})
  deprecatedSince?: string;

  @Expose({name: 'deprecated_message'})
  deprecatedMessage?: string;


  status: LabTypeObjectStatus;

  get name(): string {
    return this.humanName || this.modelName;
  }
}

export type LabTypeEntityDatasource = FlDatasourcePaginated<LabTypeEntity>;

