/**
 * Response when logged in a user to the lab instance
 */
import {ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';

export interface CnExternalLabLoginResponse {
  temp_token: string;
}

export type CnExternalLabUserRole = 'ADMIN' | 'USER';

export interface CnExternalLabUser {
  id: string;
  email: string;
  group: CnExternalLabUserRole;
  is_active: boolean;
  first_name: string;
  last_name: string;
  theme: ClTheme;
  lang: ClSupportedLanguage;
  photo: string;
}


export interface CnExternalLabCallView {
  values: Record<string, any>;
  transformers: any[];
  save_view_config: boolean;
}

/**
 * Object that represent the current global activity of a lab
 */
export interface CnLabGlobalActivity {
  running_experiments: number;
  queued_experiments: number;
  last_activity: {
    created_at: string;
  };
  dev_env_running: boolean;
}


////////////////////////// BACKUP //////////////////////////
export interface CnExternalLabBackupInfoDto {
  buckets: CnExternalLabBackupBucketDto[];
}

export interface CnExternalLabBackupBucketDto {
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  bucket: string;
  endpoint: string;
  region: string;
}


export interface CnExternalLabBackup {
  status: 'IN_PROGRESS' | 'DONE' | 'ERROR';
  storages: CnExternalLabBackupStorage[];
  message?: string;
}

export interface CnExternalLabBackupStorage {
  region: string;
  bucket: string;
  endpoint: string;
  startUploadAt: Date;
  endUploadAt?: Date;
  status: 'IN_PROGRESS' | 'DONE' | 'ERROR';
  message?: string;
}

export interface CnExternalLabBackupHistory {
  version: number;
  backups: CnExternalLabBackup[];
}
