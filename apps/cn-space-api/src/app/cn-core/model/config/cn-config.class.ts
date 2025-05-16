/**
 * Profile of the running session to know in which environment we are
 */
export type CnEnvironmentProfile = 'dev' | 'docker' | 'preprod' | 'prod' | 'test';

export const CN_ENVIRONMENT_PROFILE_KEY = 'ENVIRONMENT_PROFILE';
export const CN_ENVIRONMENT_PROFILE_PROD_VALUE = 'prod';

export const CN_LOCAL_SPACE_COOKIE = 'local-space';
export const CN_HIERARCHY_OBJECT_TOKEN_HEADER = 'cn-hierarchy-object-token';
export /**
 * Object containing info for database connexion
 */
interface CnDatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

/**
 * Header for the ApiKey when communicating with a lab
 */
export const cnExternalLabApiKeyHeader: string = 'Authorization';
export const cnExternalLabApiKeySchema: string = 'api-key';
export const cnExternalLabUserHeader: string = 'User';
export const cnExternalLabManagerVersionHeader: string = 'lab-manager-version';
// header provided when the lab call the api using an access token
export const cnExternalLabApiTokenHeader: string = 'access-token';

/**
 *  Content of the activation token
 */
export interface CnUserTokenPayload {
  id: string;
}

/**
 * Information to call an external api
 */
export interface CnExternalApiInfo {
  apiUrl: string;
  apiKey: string;
}
