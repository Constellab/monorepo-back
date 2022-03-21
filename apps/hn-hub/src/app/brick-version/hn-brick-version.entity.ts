import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {HnBaseEntity} from '../core/model/entities/hn-base.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';
import {CmVersion} from '@monorepo/common-model';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';

export class HnBrickPathVersion {
  id: string;
  path: string;
  version: string;
}

export enum HnRepoType {
  PIP = 'PIP',
  GIT = 'GIT'
}

export class HnNewVersionDTO {
  brickId: string;

  version: string;

  repoType: HnRepoType;
}

@Unique(['brickMajorVersion', 'minor', 'patch'])
@Entity('BrickVersion')
export class HnBrickVersion extends HnBaseEntity {

  @Column({default: 0})
  minor: number;

  @Column({default: 0})
  patch: number;

  @Column({type: 'enum', enum: HnRepoType, nullable: false})
  repoType: HnRepoType;

  @BlNotUpdatable()
  @ManyToOne(() => HnBrickMajorVersion, {eager: true, onDelete: "CASCADE"})
  brickMajorVersion: HnBrickMajorVersion;

  initialize(brickMajorVersion: HnBrickMajorVersion, version: CmVersion, repoType?: HnRepoType): void {
    this.brickMajorVersion = brickMajorVersion;
    this.version = version;
    this.repoType = repoType;
  }

  // Default : '1.0.0'
  getVersion(): string {
    return this.version.toString();
  }

  public get version(): CmVersion{
    return new CmVersion(this.brickMajorVersion.major, this.minor, this.patch);
  }

  public set version(version: CmVersion) {
    this.minor = version.minor;
    this.patch = version.patch;
    this.brickMajorVersion.major = version.major;
  }

}
