export type TdTypeObjectType = 'TASK' | 'RESOURCE' | 'PROTOCOL' | 'MODEL';

export type TdTypeObjectSubType = 'TASK' | 'RESOURCE' | 'PROTOCOL' | 'TRANSFORMER' | 'IMPORTER' | 'EXPORTER';

export type TdTypeObjectStatus = 'SUCCESS' | 'TYPE_UNAVAILABLE';

export interface TdTypeEntity {

  brickName: string;

  humanName: string;

  shortDescription: string | undefined;

  doc: string;

  parentTypingName: string | undefined;

  parentHumanName: string | undefined;

  parentVersion: string | undefined;

  objectType: TdTypeObjectType;

  objectSubType: TdTypeObjectSubType;

  status: TdTypeObjectStatus | undefined;

  deprecatedSince: string | undefined;

  deprecatedMessage: string | undefined;
}


export interface TdUniqueType{
  typingName: string;

  humanName: string;

  version: string;
}
