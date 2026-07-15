import {
  BlBadRequestException,
  BlEntityWithId,
  BlNotUpdatable,
  BlVersion,
  BlVersionTransform,
} from '@monorepo/back-core-lib';
import { Exclude, Expose } from 'class-transformer';
import { Column, Entity, ManyToOne } from 'typeorm';

import { CnBrick } from './cn-brick.entity';

export enum CnRepoType {
  PIP = 'PIP',
  GIT = 'GIT',
}

export enum CnVersionState {
  STABLE = 'STABLE',
  LATEST = 'LATEST',
  NEXT = 'NEXT',
}

export enum CnVersionType {
  NORMAL = 'NORMAL',
  BETA = 'BETA',
}

@Entity('brick_version')
export class CnBrickVersion extends BlEntityWithId {
  @BlNotUpdatable()
  @ManyToOne(() => CnBrick, { onDelete: 'CASCADE', nullable: false })
  brick!: CnBrick;

  @Exclude()
  @Column({ default: 1 })
  major!: number;

  @Exclude()
  @Column({ default: 0 })
  minor!: number;

  @Exclude()
  @Column({ default: 0 })
  patch!: number;

  @Column({ default: null, nullable: true, type: 'int' })
  subPatch!: number | null;

  @Column({ type: 'enum', enum: CnVersionType, nullable: false })
  versionType!: CnVersionType;

  @Column({ type: 'enum', enum: CnVersionState, nullable: false, default: CnVersionState.STABLE })
  versionState!: CnVersionState;

  @Column({ type: 'enum', enum: CnRepoType, nullable: false })
  repoType!: CnRepoType;

  @Column({ type: 'simple-json', nullable: true })
  technicalInfo!: Record<string, string> | null;

  @BlVersionTransform()
  @Expose()
  public get version(): BlVersion {
    return new BlVersion(
      this.major,
      this.minor,
      this.patch,
      this.versionType === CnVersionType.BETA ? this.subPatch ?? undefined : undefined
    );
  }

  public set version(version: BlVersion) {
    this.major = version.major;
    this.minor = version.minor;
    this.patch = version.patch;
  }

  public getRepo(): string {
    const repo = this.repoType === CnRepoType.PIP ? this.brick.pipRepo : this.brick.gitRepo;

    if (!repo) {
      throw new BlBadRequestException(
        `The ${this.repoType} repository url for brick ${this.brick.name} is not defined`
      );
    }
    return repo;
  }
}
