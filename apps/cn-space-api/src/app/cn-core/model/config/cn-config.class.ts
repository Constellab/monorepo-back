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
export const CN_EXTERNAL_LAB_API_KEY_HEADER: string = 'Authorization';
export const CN_EXTERNAL_LAB_QUERY_PARAM_KEY_HEADER: string = 'authorization';
export const CN_EXTERNAL_LAB_API_KEY_SCHEMA: string = 'api-key';
export const CN_EXTERNAL_LAB_USER_HEADER: string = 'User';
export const CN_EXTERNAL_LAB_MANAGER_VERSION_HEADER: string = 'lab-manager-version';
// header provided when the lab call the api using an access token
export const CN_EXTERNAL_LAB_API_TOKEN_HEADER: string = 'access-token';

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

  /**
   * Optional private IP to resolve the apiUrl hostname to, instead of public DNS.
   * Used for on-premise labs only reachable on the client network: the apiUrl
   * hostname is kept untouched (so TLS/SNI and the Host header still work) and
   * only the DNS resolution is overridden at request time.
   */
  ipOverride?: string;
}
