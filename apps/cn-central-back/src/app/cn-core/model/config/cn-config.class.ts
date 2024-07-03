/**
 * Profile of the running session to know in which environment we are
 */
export type CnEnvironmentProfile = 'dev' | 'docker' | 'preprod' | 'prod' | 'test';

export const CN_ENVIRONMENT_PROFILE_KEY = 'ENVIRONMENT_PROFILE';
export const CN_ENVIRONMENT_PROFILE_PROD_VALUE = 'prod';

export const CN_RABBITMQ_USER_KEY = 'RABBITMQ_USER';
export const CN_RABBITMQ_PASSWORD_KEY = 'RABBITMQ_PASSWORD';
export const CN_RABBITMQ_URL_KEY = 'RABBITMQ_URL';
export const CN_RABBITMQ_PORT_KEY = 'RABBITMQ_PORT';

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
export const cnExternalLabManagerVersionHeader: string = 'lab-manager-version';

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

