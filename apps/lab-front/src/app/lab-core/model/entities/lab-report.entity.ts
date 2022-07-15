import {LabBaseEntityWithUser, LabUser} from './lab-user.entity';
import {Expose, Type} from 'class-transformer';
import {FlQuillJson} from '@monorepo/front-core-lib';
import {LabProject} from './lab-project.class';
import {LabEntity} from '../global/lab-entity.entity';
import {ClLuxonTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';

export type LabReportContent = FlQuillJson;

export class LabReport extends LabBaseEntityWithUser {

  title: string;

  content: LabReportContent;


  @Type(() => LabProject)
  project: LabProject;

  @Expose({name: 'is_validated'})
  isValidated: boolean;

  @Expose({name: 'validated_by'})
  @Type(() => LabUser)
  validatedBy?: LabUser;

  @Expose({name: 'validated_at'})
  @ClLuxonTransform()
  validatedAt?: DateTime;
}

export interface LabReportForm {
  title: string;
  project: LabEntity;
}
