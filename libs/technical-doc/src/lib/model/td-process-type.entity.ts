import {TdTypeEntity} from './td-type.entity';

export interface TdProcessType extends TdTypeEntity {
  inputSpecs: Record<string, TdIOSpec>;

  outputSpecs: Record<string, TdIOSpec>;

  configSpecs: Record<string, TdConfigSpec>;

  additionalInfo: TdAdditionalInfoDTO | undefined;
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

export type TdConfigSpec =
  TdConfigSpecSimple
  | TdConfigSpecParamSet;

export type TdConfigSpecSimple =
  TdConfigSpecString
  | TdConfigSpecFloat
  | TdConfigSpecList
  | TdConfigSpecBoolean
  | TdConfigSpecTags;

export interface TdConfigSpecString extends TdConfigSpecBase {

  type: 'str';
}

export interface TdConfigSpecFloat extends TdConfigSpecBase {

  type: 'int' | 'float';

  // min value validator
  min_value: number;

  // max value validator
  max_value: number;
}

export interface TdConfigSpecBoolean extends TdConfigSpecBase {
  type: 'bool';
}

export interface TdConfigSpecList extends TdConfigSpecBase {
  type: 'list';
}

export interface TdConfigSpecTags extends TdConfigSpecBase {
  type: 'tags_param';
}


export interface TdConfigSpecBase {
  /**
   * Type of the config value (string, float...)
   */
  type: TdConfigSpecType;

  /**
   * If false the config if mandatory
   */
  optional: boolean;

  /**
   * Default value
   */
  default_value?: any;

  /**
   * Measure unit of the value (ex km)
   */
  unit?: string;

  /**
   * Human-readable name for the config
   */
  human_name?: string;

  /**
   * Short description for the config
   */
  short_description?: string;

  /**
   * Visibility for the config, if protected, it is considered as advanced option
   */
  visibility: TdConfigSpecVisibility;

  allowed_values?: any;
}

// If the config property is a string or a float
export type TdConfigSpecType = 'str' | 'int' | 'float' | 'list' | 'bool' | 'param_set' | 'tags_param';
export type TdConfigSpecVisibility = 'protected' | 'public';


export interface TdConfigSpecParamSet extends TdConfigSpecBase {
  type: 'param_set';
  param_set: Record<string, TdConfigSpec>;
  max_number_of_occurrences: number;
}

export interface TdAdditionalInfoDTO {
  supported_extensions: string[];
}
