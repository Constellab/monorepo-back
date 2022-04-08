import {BlEntityWithId} from '@monorepo/back-core-lib';
import {Column} from 'typeorm';

export abstract class HnGeneratedDocEntity extends BlEntityWithId {
  @Column()
  brickName: string;

  @Column()
  brickMajor: number;

  @Column()
  uniqueName: string;
  @Column()
  className: string;
  @Column()
  humanName: string;

  @Column({nullable: true})
  shortDescription?: string;
  @Column()
  doc: string;

  @Column({nullable: true})
  parentUniqueName?: string;

  @Column({nullable: true})
  parentBrick?: string;

  @Column({nullable: true})
  parentMajor?: number;

  @Column()
  hide: boolean;

  @Column({nullable: true})
  deprecatedSinceMajor?: number;

  @Column({nullable: true})
  deprecatedMessage?: string;
}
