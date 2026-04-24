/**
 * Object that represent the config file of a lab (config.json)
 */
export interface CnLabConfigFile {
  // @deprecated - to remove once all lab managers are on version 2.12.0 or higher
  lab_id: string;
  // @deprecated - to remove once all lab managers are on version 2.12.0 or higher
  name: string;
  front_version: string;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  glab_tag: 'latest' | 'beta' | string;
  biota_maria_db_url?: string;
  variables: Record<string, string>;
  environment: CnLabConfigFileEnv;
}

export interface CnLabConfigFileEnv {
  bricks: CnConfigFileBrick[];
  pip: CnConfigFileEnvRepository[];
  git: CnConfigFileEnvRepository[];
  variables: Record<string, string>;
}

export interface CnConfigFileBrick {
  name: string;
  version: string;
}

export interface CnConfigFileEnvRepository {
  source: string;
  packages: CnConfigFileEnvPackage[];
}

export interface CnConfigFileEnvPackage {
  name: string;
  version: string; // version supported by pip, can be empty, ==2.0 or >=2.1
}
