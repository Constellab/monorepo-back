/**
 * Define the type of the param spec
 */
export type TdParamSpecType =
  'str'
  | 'text'
  | 'int'
  | 'float'
  | 'list'
  | 'bool'
  | 'param_set'
  | 'tags_param'
  | 'python_code_param' | 'r_code_param' | 'julia_code_param'
  | 'bash_code_param' | 'perl_code_param' | 'yaml_code_param' | 'json_code_param';

/**
 * Visibility of the param spec
 * - public: basic param
 * - protected: advanced param
 */
export type TdParamSpecVisibility = 'protected' | 'public';


/**
 * Common base for all param spec
 */
export interface TdParamSpecBase {
  /**
   * Type of the param value (string, float...)
   */
  type: TdParamSpecType;

  /**
   * If false the param if mandatory
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
   * Human-readable name for the param
   */
  human_name?: string;

  /**
   * Short description for the param
   */
  short_description?: string;

  /**
   * Visibility for the param, if protected, it is considered as advanced option
   */
  visibility: TdParamSpecVisibility;

  allowed_values?: any;

  /**
   * Custom properties depending on the type of the param
   */
  additional_info: any;
}

/**
 * All param set spec type including param set spec
 */
export type TdParamSpec =
  TdParamSpecSimple
  | TdParamSpecParamSet;

/**
 * Basic param spec (excluding param set)
 */
export type TdParamSpecSimple =
  TdParamSpecString | TdParamSpecText
  | TdParamSpecFloat
  | TdParamSpecList
  | TdParamSpecBoolean
  | TdParamSpecTags
  | TdParamSpecCode;

/**
 * Param for short string
 */
export interface TdParamSpecString extends TdParamSpecBase {
  type: 'str';

  additional_info: {
    min_length?: number;
    max_length?: number;
  };
}

/**
 * Param for long text
 */
export interface TdParamSpecText extends TdParamSpecBase {
  type: 'text';
}


export interface TdParamSpecFloat extends TdParamSpecBase {

  type: 'int' | 'float';

  additional_info: {
    min_value?: number;
    max_value?: number;
  };

}

export interface TdParamSpecBoolean extends TdParamSpecBase {
  type: 'bool';
}

export interface TdParamSpecList extends TdParamSpecBase {
  type: 'list';
}

export interface TdParamSpecTags extends TdParamSpecBase {
  type: 'tags_param';
}

export interface TdParamSpecCode extends TdParamSpecBase {
  type: 'python_code_param' | 'r_code_param' | 'julia_code_param'
    | 'bash_code_param' | 'perl_code_param' | 'yaml_code_param' | 'json_code_param';
}

/**
 * Special param spec that contains sub params
 */
export interface TdParamSpecParamSet extends TdParamSpecBase {
  type: 'param_set';

  additional_info: {
    param_set: Record<string, TdParamSpec>;
    max_number_of_occurrences: number;
  };
}


// list of param spec type that uses a code editor
export const tdCodeParamSpecTypeList: TdParamSpecType[] = [
  'python_code_param', 'r_code_param', 'julia_code_param',
  'bash_code_param', 'perl_code_param', 'yaml_code_param', 'json_code_param',
];
