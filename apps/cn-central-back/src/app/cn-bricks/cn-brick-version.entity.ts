import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {BlEntityWithId, BlNotUpdatable} from '@monorepo/back-core-lib';
import {CnBrick} from './cn-brick.entity';
import {CmVersion, CmVersionTransform} from '@monorepo/common-model';
import {Exclude, Expose} from 'class-transformer';
import {BadRequestException} from '@nestjs/common';

export enum CnRepoType {
  PIP = 'PIP',
  GIT = 'GIT'
}

@Unique(['brick', 'major', 'minor', 'patch'])
@Entity('brick_version')
export class CnBrickVersion extends BlEntityWithId {
  @BlNotUpdatable()
  @ManyToOne(() => CnBrick, {onDelete: 'CASCADE'})
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
  commitRef: string; // provided if repoType === GIT

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

  public getRepo(): string {
    const repo = this.repoType === CnRepoType.PIP ? this.brick.pipRepo : this.brick.gitRepo;

    if (!repo) {
      throw new BadRequestException(`The ${this.repoType} repository url for brick ${this.brick.name} is not defined`);
    }
    return repo;
  }
}
