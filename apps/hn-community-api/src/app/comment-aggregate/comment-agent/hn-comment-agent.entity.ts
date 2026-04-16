import { Type } from 'class-transformer';
import { Entity, ManyToOne } from 'typeorm';

import { HnAgent } from '../../agent-aggregate/agent/hn-agent.entity';
import { HnCommentEntity } from '../comment-core/hn-comment.entity';

@Entity('comment_agent')
export class HnCommentAgent extends HnCommentEntity<HnAgent> {
  @Type(() => HnAgent)
  @ManyToOne(() => HnAgent, { onDelete: 'CASCADE', nullable: false })
  entity: HnAgent;
}
