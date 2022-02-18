import {Column, Entity, ManyToOne} from 'typeorm';
import {BlEntityWithId, BlNotUpdatable} from '@monorepo/back-core-lib';
import {CnBrick} from './cn-brick.entity';
import {CmVersion, CmVersionTransform} from '@monorepo/common-model';
import {Exclude, Expose} from 'class-transformer';

export enum CnRepoType {
  PIP = 'PIP',
  GIT = 'GIT'
}

@Entity('brick_version')
export class CnBrickVersion extends BlEntityWithId {
  @BlNotUpdatable()
  @ManyToOne(() => CnBrick, {eager: false, onDelete: 'CASCADE'})
  brick: CnBrick;

  @Exclude()
  @Column({default: 1})
  major: number;

  @Exclude()
  @Column({default: 0})
  minor: number;

  @Exclude()
  @Column({default: 0})
  patch: number;

  @Column()
  isLatest: boolean = true;

  @Column({type: 'enum', enum: CnRepoType, nullable: false})
  repoType: CnRepoType;

  @Column({nullable: true})
  commitRef: string;

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
