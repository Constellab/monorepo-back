export type TdTypeObjectType = 'TASK' | 'RESOURCE' | 'PROTOCOL' | 'MODEL';

export type TdTypeObjectSubType = 'TASK' | 'PROTOCOL' | 'TRANSFORMER' | 'IMPORTER' | 'EXPORTER';

export type TdTypeObjectStatus = 'SUCCESS' | 'TYPE_UNAVAILABLE';

export interface TdTypeEntity {

  brickName: string | undefined;

  uniqueName: string | undefined;

  humanName: string | undefined;

  shortDescription: string | undefined;

  doc: string | undefined;

  parentTypingName: string | undefined;

  parentMajorVersion: number | undefined;

  parentHumanName: string | undefined;

  parentVersion: string | undefined;

  objectType: TdTypeObjectType | undefined;

  status: TdTypeObjectStatus | undefined;
}


export interface TdUniqueType{
  typingName: string;

  humanName: string;

  version: string;
}
