import {TdTypeEntity} from './td-type.class';
import {TdParamSpec} from './td-config-spec.class';

export interface TdProcessType extends TdTypeEntity {
  inputSpecs: Record<string, TdIOSpec>;

  outputSpecs: Record<string, TdIOSpec>;

  configSpecs: Record<string, TdParamSpec>;

  additionalInfo: TdProcessAdditionalInfoDTO | undefined;
}

export interface TdProcessAdditionalInfoDTO {
  supported_extensions: string[];
}

export interface TdIOSpec {

  resource_types: TdResourceTypeDTO[];

  human_name: string;

  short_description: string;

  is_optional?: boolean;

  is_skippable?: boolean;

  is_constant?: boolean;
}

export interface TdResourceTypeDTO {
  typing_name: string;

  human_name: string;

  short_description: string;

  brick_version: string;
}
