import {CaBaseEntity} from './ca-base-entity.class';
import {FlQuillJson} from '@monorepo/front-core-lib';

export class CaReport extends CaBaseEntity {

  title: string;

  content: FlQuillJson;

  projectId: string;
}
