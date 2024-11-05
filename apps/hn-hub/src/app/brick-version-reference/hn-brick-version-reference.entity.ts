import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { HnBrickVersion } from '../brick-aggregate/brick-version/hn-brick-version.entity';
import { BlEntityWithId } from '@monorepo/back-core-lib';

export enum HnBrickVersionRefState {
  DIRECT = 'DIRECT',
  INDIRECT = 'INDIRECT',
}

@Unique(['brickVersionId', 'referenceId'])
@Entity('brick_version_reference')
export class HnBrickVersionReference extends BlEntityWithId {
  @Column({ type: 'enum', enum: HnBrickVersionRefState, nullable: false })
  versionState: HnBrickVersionRefState;

  @ManyToOne(() => HnBrickVersion, (object) => object.id, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brickVersionId' })
  brickVersion: HnBrickVersion;

  @Column({ nullable: false })
  brickVersionId: string;

  @ManyToOne(() => HnBrickVersion, (object) => object.id, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'referenceId' })
  reference: HnBrickVersion;

  @Column({ nullable: false })
  referenceId: string;
}
