import { Column, Entity, OneToMany } from 'typeorm';
import { BlEntityWithId } from '@monorepo/back-core-lib';
import { CnBrickVersion } from './cn-brick-version.entity';

export enum CnBrickVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

/**
 * A brick is a functionality in a Lab.
 * A lab is configured with multiple bricks
 */
@Entity('brick')
export class CnBrick extends BlEntityWithId {
  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: true })
  pipRepo: string;

  @Column({ nullable: true })
  gitRepo: string;

  @OneToMany(() => CnBrickVersion, (brickVersion: CnBrickVersion) => brickVersion.brick)
  versions: CnBrickVersion[];

  @Column({ type: 'enum', enum: CnBrickVisibility, default: CnBrickVisibility.PUBLIC })
  visibility: CnBrickVisibility;
}
