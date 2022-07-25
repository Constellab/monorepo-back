import {CaBaseEntity} from './ca-base-entity.class';
import {FlQuillJson} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';
import {CaUser} from './ca-user.class';
import {ClLuxonTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {CaProjectObject} from './ca-project.class';

export class CaReport extends CaBaseEntity implements CaProjectObject{

  title: string;

  content: FlQuillJson;

  projectId: string;

  isValidated: boolean;

  @Type(() => CaUser)
  validatedBy?: CaUser;

  @ClLuxonTransform()
  validatedAt?: DateTime;

  @ClLuxonTransform()
  lastSyncAt?: DateTime;

  @Type(() => CaUser)
  lastSyncBy?: CaUser;
}
