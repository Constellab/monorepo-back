import {LabBaseEntity} from '../../global/lab-entity.entity';
import {Expose} from 'class-transformer';
import {FlDatasourcePaginated} from '@monorepo/front-core-lib';
import {TdTypeEntity, TdTypeObjectStatus, TdTypeObjectSubType, TdTypeObjectType} from '@monorepo/technical-doc';

export class LabTypeEntity extends LabBaseEntity implements TdTypeEntity {
  @Expose({name: 'object_type'})
  objectType: TdTypeObjectType;

  @Expose({name: 'typing_name'})
  typingName: string;

  @Expose({name: 'model_name'})
  modelName: string;

  @Expose({name: 'human_name'})
  humanName: string;

  @Expose({name: 'short_description'})
  shortDescription: string | undefined;

  @Expose({name: 'object_sub_type'})
  objectSubType: TdTypeObjectSubType;

  @Expose({name: 'deprecated_since'})
  deprecatedSince?: string;

  @Expose({name: 'deprecated_message'})
  deprecatedMessage?: string;

  parent?: {
    brick_version: string;
    human_name: string;
    typing_name: string;
  };


  doc: string | undefined;

  status: TdTypeObjectStatus;

  hasDocumentation(): boolean {
    return this?.doc != null ?? false;
  }

  get name(): string {
    return this.humanName || this.modelName;
  }

  get parentTypingName(): string {
    return this.parent?.typing_name ?? null;
  }

  get parentHumanName(): string {
    return this.parent?.human_name ?? null;
  }

  get parentVersion(): string {
    return this.parent?.brick_version ?? null;
  }

  // TODO TO REMOVE
  get uniqueName(): string {
    return '';
  }
}

export type LabTypeEntityDatasource = FlDatasourcePaginated<LabTypeEntity>;

