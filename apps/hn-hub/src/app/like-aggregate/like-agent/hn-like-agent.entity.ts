import {HnAbstractLikeEntity} from '../like-core/hn-abstract-like.entity';
import {Type} from 'class-transformer';
import {Entity, ManyToOne} from 'typeorm';
import {HnAgent} from '../../agent-aggregate/agent/hn-agent.entity';

@Entity('like_agent')
export class HnLikeAgent extends HnAbstractLikeEntity<HnAgent> {
  @Type(() => HnAgent)
  @ManyToOne(() => HnAgent, {eager: true, onDelete: 'CASCADE'})
  entity: HnAgent;
}
