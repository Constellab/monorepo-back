import { BlEntityWithId } from '@monorepo/back-core-lib';
import { Entity, ManyToOne } from 'typeorm';

import { HnUser } from '../../users/hn-user.entity';
import { HnAgent } from '../agent/hn-agent.entity';

@Entity('agent_co_author')
export class HnAgentCoAuthor extends BlEntityWithId {
  @ManyToOne(() => HnAgent, (agent) => agent.agentCoAuthors, { nullable: false })
  agent: HnAgent;

  @ManyToOne(() => HnUser, { eager: true, onDelete: 'CASCADE', nullable: false })
  user: HnUser;

  initCoAuthor(agent: HnAgent, user: HnUser): void {
    this.agent = agent;
    this.user = user;
  }
}
