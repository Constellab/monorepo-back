export type TdTypeObjectType = 'TASK' | 'RESOURCE' | 'PROTOCOL' | 'MODEL';

export type TdTypeObjectSubType = 'TASK' | 'PROTOCOL' | 'TRANSFORMER' | 'IMPORTER' | 'EXPORTER';

export type TdTypeObjectStatus = 'SUCCESS' | 'TYPE_UNAVAILABLE';

export interface TdTypeEntity {

  brickName: string;

  uniqueName: string;

  humanName: string;

  shortDescription?: string;

  doc?: string;

  parentTypingName?: string;

  parentMajorVersion?: number;

  parentHumanName?: string;

  parentVersion?: string;

  objectType: TdTypeObjectType;
}
