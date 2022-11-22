/**
 * Response when logged in a user to the lab instance
 */

export interface CnExternalLabLoginResponse {
  temp_token: string;
}

export type CnExternalLabUserRole = 'ADMIN' | 'USER';

export interface CnExternalLabUser {
  id: string;
  email: string;
  group: CnExternalLabUserRole;
  is_active: boolean;
  is_admin: boolean;
  first_name: string;
  last_name: string;
}

export interface CnExternalNewLabUser {
  userId: string;
  group: CnExternalLabUserRole;
}

export interface CnExternalLabCallView {
  values: Record<string, any>;
  transformers: any[];
  save_view_config: boolean;
}



////////////////////////// BACKUP //////////////////////////
export interface CnExternalLabCreateBackupDto {
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  bucket: string;
  endpoint: string;
  region: string;
}


export interface CnExternalLabBackup {
  status: 'IN_PROGRESS'| 'DONE' | 'ERROR';
  storages: CnExternalLabBackupStorage[];
  message?: string;
}

export interface CnExternalLabBackupStorage{
  region: string;
  bucket: string;
  endpoint: string;
  startUploadAt: Date;
  endUploadAt?: Date;
  status: 'IN_PROGRESS'| 'DONE' | 'ERROR';
  message?: string;
}

export interface CnExternalLabBackupHistory{
  version: number;
  backups: CnExternalLabBackup[];
}
