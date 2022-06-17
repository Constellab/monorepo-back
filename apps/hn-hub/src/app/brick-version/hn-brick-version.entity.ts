import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {HnBaseEntity} from '../core/model/entities/hn-base.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';
import {CmVersion} from '@monorepo/common-model';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';
import {HnBrickVersionRefState} from '../brick-version-reference/hn-brick-version-reference.entity';

export class HnBrickPathVersion {
  id: string;
  path: string;
  version: string;
}

export enum HnRepoType {
  PIP = 'PIP',
  GIT = 'GIT'
}

export enum HnVersionType {
  NORMAL = 'NORMAL',
  BETA = 'BETA'
}

export class HnNewVersionDTO {
  brickId: string;

  version: string;

  repoType: HnRepoType;

  references?: HnReferenceDTO[];

  technicalInfo?: Record<string, any>;
}

export interface HnReferenceDTO {
  name: string;
  version: string;
  referenceState: HnBrickVersionRefState
}

@Unique(['brickMajorVersion', 'minor', 'patch', 'subPatch'])
@Entity('BrickVersion')
export class HnBrickVersion extends HnBaseEntity {

  @Column({default: 0})
  minor: number;

  @Column({default: 0})
  patch: number;

  @Column({default: null, nullable: true})
  subPatch: number;

  @Column({type: 'enum', enum: HnVersionType, nullable: false})
  versionType: HnVersionType;

  @Column({type: 'enum', enum: HnRepoType, nullable: false})
  repoType: HnRepoType;

  @BlNotUpdatable()
  @ManyToOne(() => HnBrickMajorVersion, {eager: true, onDelete: "CASCADE"})
  brickMajorVersion: HnBrickMajorVersion;

  @Column({name: 'technicalInfo', type: 'simple-json', nullable: true})
  technicalInfo?: Record<string, any>;

  initialize(brickMajorVersion: HnBrickMajorVersion, version: CmVersion, repoType: HnRepoType, technicalInfo: Record<string, any>): void {
    this.brickMajorVersion = brickMajorVersion;
    this.version = version;
    this.repoType = repoType;
    this.technicalInfo = technicalInfo;
  }

  // Default : '1.0.0'
  getVersion(): string {
    return this.version.toString();
  }

  public get version(): CmVersion {
    return new CmVersion(this.brickMajorVersion.major, this.minor, this.patch,
      this.versionType === HnVersionType.BETA ? this.subPatch : null);
  }

  public set version(version: CmVersion) {
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
