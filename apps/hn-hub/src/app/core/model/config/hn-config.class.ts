/**
 * Profile of the running session to know in which environment we are
 */
export type HnEnvironmentProfile = 'dev' | 'docker' | 'preprod' | 'prod' | 'test';

export const HN_ENVIRONMENT_PROFILE_KEY = 'ENVIRONMENT_PROFILE';
export const HN_ENVIRONMENT_PROFILE_PROD_VALUE = 'prod';
export const HN_RABBITMQ_USER_KEY = 'RABBITMQ_USER';
export const HN_RABBITMQ_PASSWORD_KEY = 'RABBITMQ_PASSWORD';
export const HN_RABBITMQ_URL_KEY = 'RABBITMQ_URL';
export const HN_RABBITMQ_PORT_KEY = 'RABBITMQ_PORT';

export const HN_BUCKET_ICON_KEY = 'BUCKET_ICON';
export const HN_BUCKET_ICON_BACKUP_KEY = 'BUCKET_ICON_BACKUP';

export const HN_BUCKET_DOCUMENTATION_KEY = 'BUCKET_DOCUMENTATION';
export const HN_BUCKET_DOCUMENTATION_BACKUP_KEY = 'BUCKET_DOCUMENTATION_BACKUP';

export const HN_BUCKET_STORIES_KEY = 'BUCKET_STORIES';

export const HN_BUCKET_STORIES_BACKUP_KEY = 'BUCKET_STORIES_BACKUP';
