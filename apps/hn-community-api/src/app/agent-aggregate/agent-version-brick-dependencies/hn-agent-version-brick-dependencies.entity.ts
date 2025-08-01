import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { HnBrickVersion } from '../../brick-aggregate/brick-version/hn-brick-version.entity';
import { HnAgentVersion } from '../agent-version/hn-agent-version.entity';

@Entity('agent_version_brick_dependencies')
export class HnAgentVersionBrickDependencies {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  agentVersionId: string;

  @ManyToOne(() => HnAgentVersion, { eager: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  agentVersion: HnAgentVersion;

  @PrimaryColumn({ type: 'varchar', length: 36 })
  brickVersionId: string;

  @ManyToOne(() => HnBrickVersion, { eager: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  brickVersion: HnBrickVersion;

  init(agentVersion: HnAgentVersion, brickVersion: HnBrickVersion): void {
    this.agentVersionId = agentVersion.id;
    this.brickVersionId = brickVersion.id;
  }
}
