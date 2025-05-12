import { ClLuxonDateTransform, ClSupportedLanguage, ClTheme } from '@monorepo/core-lib';
import { DateTime } from 'luxon';

/**
 * Response when logged in a user to the lab
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
  running_scenarios: number;
  queued_scenarios: number;
  last_activity: {
    created_at: string;
  };
  dev_env_running: boolean;
}

export class CnExternalLabShareGenerateTokenResponse {
  @ClLuxonDateTransform()
  valid_until: DateTime;
  access_url: string;
}

export class CnExternalLabSyncedObjectDTO {
  id: string;
  folder_id: string;

  @ClLuxonDateTransform()
  last_sync_at: DateTime;
  last_sync_by_id: string;

  constructor(id: string, folderId: string, lastSyncAt: DateTime, lastSyncById: string) {
    this.id = id;
    this.folder_id = folderId;
    this.last_sync_at = lastSyncAt;
    this.last_sync_by_id = lastSyncById;
  }
}
