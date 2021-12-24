import {LabBaseEntityWithUser} from './lab-user.entity';
import {Expose} from 'class-transformer';
import {FlQuillJson} from '@monorepo/front-core-lib';

export type LabReportContent = FlQuillJson;

export class LabReport extends LabBaseEntityWithUser {

  title: string;

  content: LabReportContent;

  @Expose({name: 'is_validated'})
  isValidated: boolean;
}

export interface LabReportForm {
  title: string;
}
