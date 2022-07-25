import {LabEntity} from '../global/lab-entity.entity';
import {LabUser} from './lab-user.entity';
import {DateTime} from 'luxon';
import {FlEntity} from '@monorepo/front-core-lib';

export class LabProject extends LabEntity {

  title: string;

  description: string;
}

/**
 * Interface representing a object inside a project that can be validated and synchronized with central
 */
export interface LabProjectObject extends FlEntity {
  project: {
    id: string;
    title: string;
  };

  isValidated: boolean;
  validatedBy?: LabUser;
  validatedAt?: DateTime;

  lastSyncAt?: DateTime;
  lastSyncBy?: LabUser;
  isSynced: boolean;
}
