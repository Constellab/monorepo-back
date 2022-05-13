import {TdTypeEntity, TdTypeObjectType} from './td-type.entity';

export abstract class TdProcessType implements TdTypeEntity {

  brickName: string;
  doc?: string;
  humanName: string;
  objectType: TdTypeObjectType;
  parentTypingName?: string;
  parentHumanName?: string;
  parentMajorVersion?: number;
  parentVersion?: string;
  shortDescription?: string;
  uniqueName: string;
  status?: string;
}
