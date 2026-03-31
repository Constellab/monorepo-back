import { Injectable } from '@nestjs/common';

import { HnCommunitySecurity } from '../../core/security/hn-community-security.service';
import { HnUser } from '../../users/hn-user.entity';
import { HnAgent } from '../agent/hn-agent.entity';
import { HnAgentCoAuthorService } from '../agent-co-author/hn-agent-co-author.service';

@Injectable()
export class HnAgentSecurity {
  constructor(
    private communitySecurity: HnCommunitySecurity,
    private agentCoAuthorService: HnAgentCoAuthorService
  ) {}

  async assertCanEdit(agent: HnAgent, user: HnUser): Promise<void> {
    await this.communitySecurity.assertSpaceMembership(agent, user.id);
    const coAuthors = await this.agentCoAuthorService.getAgentCoAuthorsByAgentId(agent.id);
    this.communitySecurity.assertIsCreatorOrCoAuthor(agent, coAuthors, user.id);
  }

  assertIsCreator(agent: HnAgent, user: HnUser): void {
    this.communitySecurity.assertIsCreator(agent, user.id);
  }

  async assertCanView(agent: HnAgent, user: HnUser): Promise<void> {
    await this.communitySecurity.assertSpaceMembership(agent, user.id);
  }

  async isCreatorOrCoAuthor(agent: HnAgent, user: HnUser): Promise<boolean> {
    if (this.communitySecurity.isCreator(agent, user.id)) return true;
    const coAuthors = await this.agentCoAuthorService.getAgentCoAuthorsByAgentId(agent.id);
    return this.communitySecurity.isCoAuthor(coAuthors, user.id);
  }
}
