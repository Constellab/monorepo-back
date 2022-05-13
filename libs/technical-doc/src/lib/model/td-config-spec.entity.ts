export type TdConfigSpecs = Record<string, TdConfigSpec>;
/**
 * Object describing the config properties
 */
export type TdConfigSpec =
  TdConfigSpecSimple
  | TdConfigSpecParamSet;

export type TdConfigSpecSimple =
  TdConfigSpecString
  | TdConfigSpecFloat
  | TdConfigSpecList
  | TdConfigSpecBoolean
  | TdConfigSpecTags;

// If the config property is a string or a float
export type TdConfigSpecType = 'str' | 'int' | 'float' | 'list' | 'bool' | 'param_set' | 'tags_param';

export type TdConfigSpecVisibility = 'protected' | 'public';

// Typed description of the config spec
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
}

export interface TdConfigSpecString extends TdConfigSpecBase {

  type: 'str';

  /**
   * If present, the value must be in the array
   */
  allowed_values?: string[];
}

export interface TdConfigSpecFloat extends TdConfigSpecBase {

  type: 'int' | 'float';

  /**
   * If present, the value must be in the array
   */
  allowed_values?: string[];

  // min value validator
  min_value: number;

  // max value validator
  max_value: number;
}

export interface TdConfigSpecBoolean extends TdConfigSpecBase {
  type: 'bool';
  allowed_values?: void;
}

export interface TdConfigSpecList extends TdConfigSpecBase {
  type: 'list';
  allowed_values?: void;
}

export interface TdConfigSpecParamSet extends TdConfigSpecBase {
  type: 'param_set';

  param_set: Record<string, TdConfigSpec>;
  max_number_of_occurrences: number;
}

export interface TdConfigSpecTags extends TdConfigSpecBase {
  type: 'tags_param';
  allowed_values?: void;
}

