import {Entity, ManyToOne, PrimaryColumn} from 'typeorm';
import {HnLiveTaskVersion} from '../live-task-version/hn-live-task-version.entity';
import {HnBrickVersion} from '../../brick-aggregate/brick-version/hn-brick-version.entity';

@Entity('LiveTaskVersionBrickDependencies')
export class HnLiveTaskVersionBrickDependencies {
  @PrimaryColumn({type: 'varchar', length: 36})
  liveTaskVersionId: string;

  @ManyToOne(() => HnLiveTaskVersion, {eager: true, onUpdate: 'CASCADE', onDelete: 'CASCADE'})
  liveTaskVersion: HnLiveTaskVersion;

  @PrimaryColumn({type: 'varchar', length: 36})
  brickVersionId: string;

  @ManyToOne(() => HnBrickVersion, {eager: true, onUpdate: 'CASCADE', onDelete: 'CASCADE'})
  brickVersion: HnBrickVersion;

  init(liveTaskVersion: HnLiveTaskVersion, brickVersion: HnBrickVersion): void {
    this.liveTaskVersionId = liveTaskVersion.id;
    this.brickVersionId = brickVersion.id;
  }
}
