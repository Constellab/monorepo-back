import { BlEntityWithId } from '@monorepo/back-core-lib';
import { Entity, ManyToOne } from 'typeorm';

import { HnUser } from '../../users/hn-user.entity';
import { HnAgent } from '../agent/hn-agent.entity';

@Entity('agent_co_author')
export class HnAgentCoAuthor extends BlEntityWithId {
  @ManyToOne(() => HnAgent, (agent) => agent.agentCoAuthors)
  agent: HnAgent;

  @ManyToOne(() => HnUser, (user) => user.agentCoAuthors, { eager: true })
  user: HnUser;

  initCoAuthor(agent: HnAgent, user: HnUser): void {
    this.agent = agent;
    this.user = user;
  }
}
