/**
 * Class containing data useful for tests
 */
import {CnProject} from '../src/app/cn-projects-aggregate/cn-projects/cn-project.entity';
import {ClDateHelper} from '@monorepo/core-lib';

export class TestData {

  // eslint-disable-next-line max-len
  public static readonly adminUserToken: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNjg2NjU0Mi1mMDg5LTQ2ZGMtYjU3Zi1hMTFlMjVhMjNhYTUiLCJlbWFpbCI6InVzZXIuYWRtaW5AZ2VuY292ZXJ5LmNvbSIsImlhdCI6MTYwNjgzNTAxMiwiZXhwIjoxOTIyMTk1MDEyfQ.XS6d9sP7I6m5VcUla11vt5XzFnygMpJGCf4Rn0iiDZ4';

  public static get newProject(): CnProject {
    const project: CnProject = new CnProject();
    project.code = 'CODE';
    project.title = 'Title';
    project.startingDate = ClDateHelper.getDate();

    return project;
  }
}
