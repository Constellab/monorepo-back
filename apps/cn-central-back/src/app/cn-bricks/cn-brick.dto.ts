import {CnRepoType} from './cn-brick-version.entity';

export class CnBrickVersionDto {
  name: string;
  version: string;
  repo_type: CnRepoType;
  repo_commit: string;
}
