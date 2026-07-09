import { BlNotUpdatable } from '@monorepo/back-core-lib';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { HnBaseEntity } from '../../core/model/entities/hn-base.entity';
import { HnBrick, HnBrickEntity } from '../brick/hn-brick.entity';

export enum HnVersionState {
  STABLE = 'STABLE',
  LATEST = 'LATEST',
}

@Unique(['brick', 'major'])
@Entity('brick_major_version')
export class HnBrickMajorVersion extends HnBaseEntity {
  @BlNotUpdatable()
  @ManyToOne(() => HnBrickEntity, { eager: true, onDelete: 'CASCADE', nullable: false })
  brick!: HnBrick;

  @Column({ default: 1 })
  major!: number;

  @Column({ type: 'enum', enum: HnVersionState, nullable: false, default: HnVersionState.STABLE })
  versionState!: HnVersionState;

  initialize(brick: HnBrick, major: number): void {
    this.brick = brick;
    this.versionState = HnVersionState.LATEST;
    this.major = major;
  }

  get isLatest(): boolean {
    return this.versionState === HnVersionState.LATEST;
  }

  /**
   * Get the version as a string
   * If the version is the latest, return 'latest'
   * Else return 'v' + major
   */
  getStrVersion(): string {
    if (this.isLatest) return 'latest';
    return `v${this.major}`;
  }
}
