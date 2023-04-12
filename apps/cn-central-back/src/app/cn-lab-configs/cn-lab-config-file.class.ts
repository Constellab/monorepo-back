/**
 * Object that represent the config file of a lab (config.json)
 */
export interface CnLabConfigFile {
  lab_id: string;
  name: string;
  front_version: string;
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

export interface CnConfigFileBrick{
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
  is_brick: boolean;
}

