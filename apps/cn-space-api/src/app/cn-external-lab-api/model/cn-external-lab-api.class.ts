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
  share_link_valid_until: DateTime;
  // Legacy labs return a single access_url used both to embed the resource in
  // place and to open it standalone. Recent labs instead return embedded_url and
  // standalone_url. Exactly one of the two shapes is provided.
  access_url?: string;
  // Url to open the resource/app embedded in place (resource-open page / iframe).
  embedded_url?: string;
  // Url to open the resource/app standalone (e.g. in a new tab through the
  // launcher gateway).
  standalone_url?: string;
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
