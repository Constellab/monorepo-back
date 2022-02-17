import {Column, Entity} from 'typeorm';
import {BlEntityWithId} from '@monorepo/back-core-lib';

/**
 * A brick is a functionality in a Lab
 * A lab is configured with multiple bricks
 */
@Entity('brick')
export class CnBrick extends BlEntityWithId {

  @Column({nullable: false, unique: true})
  name: string;

  @Column({nullable: true})
  pipRepo: string;

  @Column({nullable: true})
  gitRepo: string;
}
