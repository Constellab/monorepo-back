/**
 * Profile of the running session to know in which environment we are
 */
export type CnEnvironmentProfile = 'dev' | 'docker' | 'preprod' | 'prod' | 'test';


/**
 * Object containing info for database connexion
 */
export interface CnDatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}


/**
 * Header for the ApiKey when communicating with a lab instance
 */
export const cnExternalLabApiKeyHeader: string = 'Authorization';
export const cnExternalLabApiKeySchema: string = 'api-key';
export const cnExternalLabUserHeader: string = 'User';

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
