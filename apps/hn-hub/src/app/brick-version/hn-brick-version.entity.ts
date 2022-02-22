import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {HnBrick} from '../brick/hn-brick.entity';
import {HnBaseEntity} from '../core/model/entities/hn-base.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';
import {CmVersion, CmVersionTransform} from '@monorepo/common-model';
import {Expose} from 'class-transformer';

export class HnBrickIdAndVersion{
  id: string;
  version?: number;
}

export class HnBrickPathVersion{
  id: string;
  path: string;
  version?: number;
}

export enum HnRepoType {
  PIP = 'PIP',
  GIT = 'GIT'
}

@Unique(['brick', 'major', 'minor', 'patch'])
@Entity('BrickVersion')
export class HnBrickVersion extends HnBaseEntity {

  @BlNotUpdatable()
  @ManyToOne(() => HnBrick, {eager: true, onDelete: "CASCADE"})
  brick: HnBrick;

  @Column({default: 1})
  major: number;

  @Column({default: 0})
  minor: number;

  @Column({default: 0})
  patch: number;

  @Column()
  isLatest: boolean = true;

  @Column({type: 'enum', enum: HnRepoType, nullable: false})
  repoType: HnRepoType;

  @Column({nullable: true})
  commitRef: string;

  // Default : '1.0.0'
  getVersion(): string{
    return [this.major, this.minor, this.patch].join('.');
  }

  initialize(brick: HnBrick, version?: number[]){
    this.brick = brick;
    if(version && version.length == 3){
      this.version = new CmVersion(version[0], version[1], version[2])
    }
  }

  @CmVersionTransform()
  @Expose()
  public get version(): CmVersion {
    return new CmVersion(this.major, this.minor, this.patch);
  }

  public set version(version: CmVersion) {
    this.major = version.major;
    this.minor = version.minor;
    this.patch = version.patch;
  }
}
