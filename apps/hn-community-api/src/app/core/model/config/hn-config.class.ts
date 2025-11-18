/**
 * Profile of the running session to know in which environment we are
 */
export type HnEnvironmentProfile = 'dev' | 'docker' | 'preprod' | 'prod' | 'test';

export const HN_ENVIRONMENT_PROFILE_KEY = 'ENVIRONMENT_PROFILE';
export const HN_ENVIRONMENT_PROFILE_PROD_VALUE = 'prod';

export const HN_API_URL = 'API_URL';

export const HN_BUCKET_ICON_KEY = 'BUCKET_ICON';
export const HN_BUCKET_ICON_BACKUP_KEY = 'BUCKET_ICON_BACKUP';

export const HN_BUCKET_DOCUMENTATION_KEY = 'BUCKET_DOCUMENTATION';
export const HN_BUCKET_DOCUMENTATION_BACKUP_KEY = 'BUCKET_DOCUMENTATION_BACKUP';

export const HN_BUCKET_STORIES_KEY = 'BUCKET_STORIES';
export const HN_BUCKET_STORIES_BACKUP_KEY = 'BUCKET_STORIES_BACKUP';

export const HN_BUCKET_AGENTS_KEY = 'BUCKET_AGENTS';
export const HN_BUCKET_AGENTS_BACKUP_KEY = 'BUCKET_AGENTS_BACKUP';

export const HN_BUCKET_APPS_KEY = 'BUCKET_APPS';
export const HN_BUCKET_APPS_BACKUP_KEY = 'BUCKET_APPS_BACKUP';

export const HN_BUCKET_PARTNERS_KEY = 'BUCKET_PARTNERS';
export const HN_BUCKET_PARTNERS_BACKUP_KEY = 'BUCKET_PARTNERS_BACKUP';

export const HN_DIFY_API_KEY = 'DIFY_API_KEY';
