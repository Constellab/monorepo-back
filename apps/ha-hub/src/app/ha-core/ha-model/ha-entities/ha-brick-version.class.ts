import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {HaEntity} from './ha-entity.class';
import {HaRepoType} from './ha-version.class';
import {HaBrickMajorVersion} from './ha-brick-major-version.class';
import {Type} from 'class-transformer';
import {CmVersion} from '@monorepo/common-model';

export class HaBrickVersion extends HaEntity{
  minor: number;
  patch: number;
  @Type(() => HaBrickMajorVersion)
  brickMajorVersion: HaBrickMajorVersion;
  repoType: HaRepoType

  public get version(): CmVersion{
    return new CmVersion(this.brickMajorVersion.major, this.minor, this.patch);
  }

  public set version(version: CmVersion){
    this.minor = version.minor;
    this.patch = version.patch;
    this.brickMajorVersion.major = version.major;
  }
}

export type HaBrickVersionDataSource = FlEntityPaginatedDatasource<HaBrickVersion>;
