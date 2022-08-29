import {LabBaseEntityWithUser, LabUser} from './lab-user.entity';
import {Expose, Type} from 'class-transformer';
import {FlDatasourcePaginated, FlQuillJson} from '@monorepo/front-core-lib';
import {LabProjectObject} from './lab-project.class';
import {LabEntity} from '../global/lab-entity.entity';
import {ClLuxonTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';

export type LabReportContent = FlQuillJson;

export class LabReport extends LabBaseEntityWithUser implements LabProjectObject {

  title: string;

  content: LabReportContent;

  project: {
    id: string;
    title: string;
  };

  @Expose({name: 'is_validated'})
  isValidated: boolean;

  @Expose({name: 'validated_by'})
  @Type(() => LabUser)
  validatedBy?: LabUser;

  @Expose({name: 'validated_at'})
  @ClLuxonTransform()
  validatedAt?: DateTime;

  @Expose({name: 'last_sync_at'})
  @ClLuxonTransform()
  lastSyncAt?: DateTime;

  @Expose({name: 'last_sync_by'})
  @Type(() => LabUser)
  lastSyncBy?: LabUser;

  get isSynced(): boolean {
    return this.lastSyncAt != null;
  }
}

export type LabReportDatasource = FlDatasourcePaginated<LabReport>;

export interface LabReportForm {
  title: string;
  project: LabEntity;
}
