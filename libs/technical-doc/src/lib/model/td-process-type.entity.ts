import {TdTypeEntity} from './td-type.entity';

export interface TdProcessType extends TdTypeEntity {
  inputSpecs: Record<string, TdIOSpecDTO> | undefined;

  outputSpecs: Record<string, TdIOSpecDTO> | undefined;

  configSpecs: Record<string, TdConfigTypeDTO> | undefined;
}

export interface TdIOSpecDTO {
  resource_types: TdResourceTypeDTO[];

  human_name: string;

  short_description: string;
}

export interface TdResourceTypeDTO {
  typing_name: string;

  human_name: string;

  short_description: string;

  brick_version: string;
}

export interface TdConfigTypeDTO {
  type: string | undefined;
  optional: boolean | undefined;
  visibility: string | undefined;
  short_description: string | undefined;
  allowed_values: any[] | undefined;
  default_value: any | undefined;
}
