import {BaseEntity} from './base-entity.class';
import {StatusHistory} from './status-history.class';
import {
  FlSanitizeTransform,
  FlStatus,
  FlStatusDict,
  FlStatusHelper,
  FlStatusTransform,
  flThemeClass
} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';
import {SecurityContext} from '@angular/core';

export type StudyStatus = 'STARTED' | 'FINISHED' | 'ARCHIVED';

export const studyStatusDict: FlStatusDict<StudyStatus> = {
  STARTED: FlStatusHelper.getSuccessStatus('STARTED', 'STARTED', 'cached'),
  FINISHED: {
    value: 'FINISHED', name: 'FINISHED', backgroundColorClass: flThemeClass.accentBackground,
    textColorClass: flThemeClass.accentText, icon: FlStatusHelper.successIcon
  },
  ARCHIVED: FlStatusHelper.getArchivedStatus('ARCHIVED')
};

export class StudyStatusHistory extends StatusHistory<StudyStatus> {

  @FlStatusTransform(studyStatusDict)
  status: FlStatus<StudyStatus>;
}

export class Study extends BaseEntity {
  title: string;

  @FlSanitizeTransform(SecurityContext.HTML)
  description: string;

  @Type(() => StudyStatusHistory)
  currentStatus: StudyStatusHistory;
}
