import {LabBaseEntityWithUser} from './lab-user.entity';
import {Expose, Type} from 'class-transformer';
import {FlQuillJson} from '@monorepo/front-core-lib';
import {LabProject} from './lab-project.class';
import {LabEntity} from '../global/lab-entity.entity';

export type LabReportContent = FlQuillJson;

export class LabReport extends LabBaseEntityWithUser {

  title: string;

  content: LabReportContent;

  @Expose({name: 'is_validated'})
  isValidated: boolean;

  @Type(() => LabProject)
  project: LabProject;
}

export interface LabReportForm {
  title: string;
  project: LabEntity;
}
