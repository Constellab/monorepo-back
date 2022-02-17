import {Column, Entity, ManyToOne} from 'typeorm';
import {BlEntityWithId, BlNotUpdatable} from '@monorepo/back-core-lib';
import {CnBrick} from './cn-brick.entity';

export enum CnRepoType {
  PIP = 'PIP',
  GIT = 'GIT'
}

@Entity('brick_version')
export class CnBrickVersion extends BlEntityWithId {
  @BlNotUpdatable()
  @ManyToOne(() => CnBrick, {eager: true, onDelete: 'CASCADE'})
  brick: CnBrick;

  @Column({default: 1})
  major: number;

  @Column({default: 0})
  minor: number;

  @Column({default: 0})
  patch: number;

  @Column()
  isLatest: boolean = true;

  @Column({type: 'enum', enum: CnRepoType, nullable: false})
  repoType: CnRepoType;

  @Column({nullable: false})
  commitRef: string;

  getVersion(): string {
    return [this.major, this.minor, this.patch].join('.');
  }
}
