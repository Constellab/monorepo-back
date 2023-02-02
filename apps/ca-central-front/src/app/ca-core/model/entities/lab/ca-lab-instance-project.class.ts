import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {Type} from 'class-transformer';
import {CaUser} from '../ca-user.class';
import {CaProject} from '../project/ca-project.class';
import {FlArrayObs} from '@monorepo/front-core-lib';

/**
 * N - N relation between lab instance and project
 */
export class CaLabInstanceProject {

  @Type(() => CaProject)
  project: CaProject;

  @ClLuxonDateTimeTransform()
  createdAt: DateTime;

  @Type(() => CaUser)
  createdBy: CaUser;
}

export class CaLabInstanceProjectDatasource extends FlArrayObs<CaLabInstanceProject> {

  protected equals(a: CaLabInstanceProject, b: CaLabInstanceProject): boolean {
    return a.project.id === b.project.id;
  }
}
