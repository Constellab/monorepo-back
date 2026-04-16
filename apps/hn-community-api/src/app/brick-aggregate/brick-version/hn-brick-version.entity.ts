import { BlNotUpdatable, BlVersion } from '@monorepo/back-core-lib';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { HnBrickVersionRefState } from '../../brick-version-reference/hn-brick-version-reference.entity';
import { HnBaseEntity } from '../../core/model/entities/hn-base.entity';
import { HnBrickMajorVersion } from '../brick-major-version/hn-brick-major-version.entity';

export enum HnRepoType {
  PIP = 'PIP',
  GIT = 'GIT',
}

export enum HnVersionType {
  NORMAL = 'NORMAL',
  BETA = 'BETA',
}

export class HnNewVersionDTO {
  brickName: string;

  version: string;

  repoType: HnRepoType;

  references?: HnReferenceDTO[];

  technicalInfo?: Record<string, any>;
}

export class HnBrickSettingsDTO {
  name: string;
  author?: string;
  version: string;
  variables?: Record<string, any>;
  technical_info?: Record<string, any>;
  environment?: HnBrickSettingsEnvironmentDTO;
}

export class HnBrickSettingsEnvironmentDTO {
  pip?: HnBrickSettingsPipSourceDTO[];
  git?: any[];
}

export class HnBrickSettingsPipSourceDTO {
  source?: string;
  packages?: HnBrickSettingsPipPackageDTO[];
}

export class HnBrickSettingsPipPackageDTO {
  name: string;
  version: string;
  comment?: string;
}

export interface HnReferenceDTO {
  name: string;
  version: string;
  referenceState: HnBrickVersionRefState;
}

@Unique(['brickMajorVersion', 'minor', 'patch', 'subPatch'])
@Entity('brick_version')
export class HnBrickVersion extends HnBaseEntity {
  @Column({ default: 0 })
  minor: number;

  @Column({ default: 0 })
  patch: number;

  @Column({ default: null, nullable: true })
  subPatch: number;

  @Column({ type: 'enum', enum: HnVersionType, nullable: false })
  versionType: HnVersionType;

  @Column({ type: 'enum', enum: HnRepoType, nullable: false })
  repoType: HnRepoType;

  @BlNotUpdatable()
  @ManyToOne(() => HnBrickMajorVersion, { eager: true, onDelete: 'CASCADE', nullable: false })
  brickMajorVersion: HnBrickMajorVersion;

  @Column({ type: 'simple-json', nullable: true })
  technicalInfo?: Record<string, any>;

  initialize(
    brickMajorVersion: HnBrickMajorVersion,
    version: BlVersion,
    repoType: HnRepoType,
    technicalInfo: Record<string, any>
  ): void {
    this.brickMajorVersion = brickMajorVersion;
    this.version = version;
    this.repoType = repoType;
    this.technicalInfo = technicalInfo;
  }

  public get version(): BlVersion {
    return new BlVersion(
      this.brickMajorVersion.major,
      this.minor,
      this.patch,
      this.versionType === HnVersionType.BETA ? this.subPatch : null
    );
  }

  public set version(version: BlVersion) {
    this.minor = version.minor;
    this.patch = version.patch;
    this.brickMajorVersion.major = version.major;
    if (version.isBeta()) {
      this.versionType = HnVersionType.BETA;
      this.subPatch = version.subPatch;
    } else {
      this.versionType = HnVersionType.NORMAL;
    }
  }
}
