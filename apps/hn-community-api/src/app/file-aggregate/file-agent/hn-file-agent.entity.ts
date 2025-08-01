import { Entity, ManyToOne } from 'typeorm';

import { HnAgent } from '../../agent-aggregate/agent/hn-agent.entity';
import { HnAbstractFileEntity } from '../file-core/hn-abstract-file.entity';

@Entity('file_agent')
export class HnFileAgent extends HnAbstractFileEntity<HnAgent> {
  @ManyToOne(() => HnAgent, (agent) => agent.agentFiles, { nullable: false, onDelete: 'CASCADE' })
  entity: HnAgent;
}
