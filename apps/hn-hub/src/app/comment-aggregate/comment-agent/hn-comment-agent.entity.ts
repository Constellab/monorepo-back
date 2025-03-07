import { HnCommentEntity } from '../comment-core/hn-comment.entity';
import { Type } from 'class-transformer';
import { Entity, ManyToOne } from 'typeorm';
import { HnAgent } from '../../agent-aggregate/agent/hn-agent.entity';

@Entity('comment_agent')
export class HnCommentAgent extends HnCommentEntity<HnAgent> {
  @Type(() => HnAgent)
  @ManyToOne(() => HnAgent, { eager: true, onDelete: 'CASCADE' })
  entity: HnAgent;
}
