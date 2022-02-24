import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {HnBaseEntity} from '../core/model/entities/hn-base.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';
import {CmVersion} from '@monorepo/common-model';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';
import {BadRequestException} from '@nestjs/common';

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

  commit?: string;

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

  @Column({nullable: true})
  commitRef: string;

  @BlNotUpdatable()
  @ManyToOne(() => HnBrickMajorVersion, {eager: true, onDelete: "CASCADE"})
  brickMajorVersion: HnBrickMajorVersion;

  initialize(brickMajorVersion: HnBrickMajorVersion, version: number[], repoType?: HnRepoType, commitRef?: string): void{
    this.brickMajorVersion = brickMajorVersion;
    this.version = new CmVersion(version[0], version[1], version[2]);
    if(repoType){
      this.repoType = repoType;
      if(this.repoType == HnRepoType.GIT){
        if(commitRef){
          this.commitRef = commitRef;
        } else {
          throw new BadRequestException('Could not create a new git version without commit ref.')
        }
      }
    }
  }

  // Default : '1.0.0'
  getVersion(): string {
    return [this.brickMajorVersion.major, this.minor, this.patch].join('.');
  }

  public set version(version: CmVersion) {
    this.minor = version.minor;
    this.patch = version.patch;
    this.brickMajorVersion.major = version.major;
  }

}
