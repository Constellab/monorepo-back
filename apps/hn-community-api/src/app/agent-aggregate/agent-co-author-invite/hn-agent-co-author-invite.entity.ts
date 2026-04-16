import { Entity, ManyToOne } from 'typeorm';

import { HnUserInvite } from '../../core/model/entities/hn-user-invite.class';
import { HnAgent } from '../agent/hn-agent.entity';

@Entity('agent_co_author_invite')
export class HnAgentCoAuthorInvite extends HnUserInvite {
  @ManyToOne(() => HnAgent, { eager: true, nullable: false })
  agent: HnAgent;
}
