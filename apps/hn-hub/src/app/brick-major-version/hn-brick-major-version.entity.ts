import {Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique} from 'typeorm';
import {HnBrick} from '../brick/hn-brick.entity';
import {HnBaseEntity} from '../core/model/entities/hn-base.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';
import {CmVersion, CmVersionTransform} from '@monorepo/common-model';
import {HnBrickVersion} from '../brick-version/hn-brick-version.entity';
import {Expose} from 'class-transformer';

export class HnBrickIdAndVersion {
  id: string;
  version?: number;
}

export class HnBrickPathVersion {
  id: string;
  path: string;
  version?: number;
}

export enum HnVersionState {
  STABLE = 'STABLE',
  LATEST = 'LATEST',
  NEXT = 'NEXT'
}

@Unique(['brick', 'major'])
@Entity('BrickMajorVersion')
export class HnBrickMajorVersion extends HnBaseEntity {

  @BlNotUpdatable()
  @ManyToOne(() => HnBrick, {eager: true, onDelete: "CASCADE"})
  brick: HnBrick;

  @Column({default: 1})
  major: number;

  @Column({type: 'enum', enum: HnVersionState, nullable: false, default: HnVersionState.STABLE})
  versionState: HnVersionState;

  initialize(brick: HnBrick, major: number) {
    this.brick = brick;
    this.versionState = HnVersionState.LATEST;
    this.major = major;
  }
}
