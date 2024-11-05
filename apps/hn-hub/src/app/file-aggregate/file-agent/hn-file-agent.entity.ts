import { Entity, ManyToOne } from 'typeorm';
import { HnAbstractFileEntity } from '../file-core/hn-abstract-file.entity';
import { HnAgent } from '../../agent-aggregate/agent/hn-agent.entity';

@Entity('file_agent')
export class HnFileAgent extends HnAbstractFileEntity<HnAgent> {
  @ManyToOne(() => HnAgent, (doc) => doc.agentFiles, { nullable: false, onDelete: 'CASCADE' })
  entity: HnAgent;
}
