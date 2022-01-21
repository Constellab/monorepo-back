/**
 * Profile of the running session to know in which environment we are
 */
export type SnEnvironmentProfile = 'dev' | 'docker' | 'preprod' | 'prod' | 'test';

/**
 * Object containing info for database connexion
 */
export interface SnDatabaseConfig {
  node: string;
  username: string;
  password: string;
}


export const SN_ENVIRONMENT_PROFILE_KEY = 'ENVIRONMENT_PROFILE';
export const SN_ENVIRONMENT_PROFILE_PROD_VALUE = 'prod';
