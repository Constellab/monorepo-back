/**
 * Response when logged in a user to the lab instance
 */
import {ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';
import {CnLabBackupFrequency} from '../../cn-lab-instances/backup/cn-lab-backup.dto';
import {BlBucketConfig} from '@monorepo/back-core-lib';

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
export interface CnExternalLabBackupInfoDTO {
  version: number;
  backupBuckets: CnExternalLabBackupBucketDTO[];
  s3Prefix: string;
}

export interface CnExternalLabBackupBucketDTO {
  backupFrequency: CnLabBackupFrequency;
  bucketConfig: BlBucketConfig;
}

