import {CaBaseEntity} from './ca-base-entity.class';
import {CaStatusHistory} from './ca-status-history.class';
import {DateTime} from 'luxon';
import {ClLuxonDateTransform} from '@monorepo/core-lib';
import {
  FlEntityPaginatedDatasource,
  FlSanitizeTransform,
  FlStatus,
  FlStatusDict,
  FlStatusHelper,
  FlStatusTransform
} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';
import {SecurityContext} from '@angular/core';

export type CaProjectStatus = 'ACTIVE' | 'IN_PROGRESS' | 'ARCHIVED';

export const caProjectStatusDict: FlStatusDict<CaProjectStatus> = {
  ACTIVE: FlStatusHelper.getInfoStatus('ACTIVE', 'ACTIVE', 'done'),
  IN_PROGRESS: FlStatusHelper.getInfoStatus('ACTIVE', 'IN_PROGRESS', FlStatusHelper.runningIcon),
  ARCHIVED: FlStatusHelper.getArchivedStatus('ACTIVE'),
};

export class CaProjectStatusHistory extends CaStatusHistory<CaProjectStatus> {

  @FlStatusTransform(caProjectStatusDict)
  status: FlStatus<CaProjectStatus>;
}


export class CaProject extends CaBaseEntity {

  code: string;

  title: string;

  @FlSanitizeTransform(SecurityContext.HTML)
  description: string;

  @ClLuxonDateTransform()
  startingDate: DateTime;

  @ClLuxonDateTransform()
  endingDate: DateTime;

  @Type(() => CaProjectStatusHistory)
  currentStatus: CaProjectStatusHistory;
}

export type CaProjectDatasource = FlEntityPaginatedDatasource<CaProject>;

