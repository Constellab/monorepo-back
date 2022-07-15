import {CaBaseEntity} from './ca-base-entity.class';
import {FlQuillJson} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';
import {CaUser} from './ca-user.class';
import {ClLuxonTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';

export class CaReport extends CaBaseEntity {

  title: string;

  content: FlQuillJson;

  projectId: string;

  @Type(() => CaUser)
  validatedBy?: CaUser;

  @ClLuxonTransform()
  validatedAt?: DateTime;
}
