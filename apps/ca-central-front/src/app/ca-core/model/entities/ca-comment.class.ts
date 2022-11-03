import {CaBaseEntity} from './ca-base-entity.class';
import {Type} from 'class-transformer';
import {CaProject} from './ca-project.class';
import {FlDatasourcePaginated, FlQuillJson} from '@monorepo/front-core-lib';


export class CaComment extends CaBaseEntity {
  content: FlQuillJson;

  isResponse: boolean;

  @Type(() => CaComment)
  parentComment: CaComment
}


export class CaProjectComment extends CaComment {
  @Type(() => CaProject)
  project: CaProject;
}


export type CaProjectCommentDatasourcePaginated = FlDatasourcePaginated<CaProjectComment>;
