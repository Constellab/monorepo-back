import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnAgent } from '../agent/hn-agent.entity';
import { HnAgentCoAuthorInvite } from '../agent-co-author-invite/hn-agent-co-author-invite.entity';
import { HnAgentCoAuthorInviteService } from '../agent-co-author-invite/hn-agent-co-author-invite.service';
import { HnAgentCoAuthor } from './hn-agent-co-author.entity';

@Injectable()
export class HnAgentCoAuthorService {
  constructor(
    @InjectRepository(HnAgentCoAuthor)
    private agentCoAuthorRepository: Repository<HnAgentCoAuthor>,
    private agentCoAuthorInviteService: HnAgentCoAuthorInviteService
  ) {}

  async getAgentCoAuthorsByAgentId(agentId: string): Promise<HnAgentCoAuthor[]> {
    return this.agentCoAuthorRepository.find({ where: { agent: { id: agentId } } });
  }

  async getAgentCoAuthorsByUserId(userId: string): Promise<HnAgentCoAuthor[]> {
    return this.agentCoAuthorRepository.find({ where: { user: { id: userId } }, relations: ['agent'] });
  }

  async removeAgentCoAuthor(agentId: string, agentCoAuthorUserId: string): Promise<void> {
    const agentCoAuthor: HnAgentCoAuthor = await this.agentCoAuthorRepository.findOneBy({
      agent: { id: agentId },
      user: { id: agentCoAuthorUserId },
    });
    if (agentCoAuthor) {
      await this.agentCoAuthorRepository.remove(agentCoAuthor);
    }
  }

  async getAgentCoAuthorInviteByToken(token: string): Promise<HnAgentCoAuthorInvite> {
    return this.agentCoAuthorInviteService.getAndCheckInvite(token);
  }

  async acceptInvite(
    agentCoAuthor: HnAgentCoAuthor,
    agentCoAuthorInvite: HnAgentCoAuthorInvite
  ): Promise<boolean> {
    return (
      (await this.agentCoAuthorInviteService.acceptUserInvite(agentCoAuthorInvite)) != null &&
      (await this.agentCoAuthorRepository.save(agentCoAuthor)) != null
    );
  }

  async getAgentCoAuthorsPendingInvites(agentId: string): Promise<HnAgentCoAuthorInvite[]> {
    return this.agentCoAuthorInviteService.getPendingUserInvitesWithUser(agentId);
  }

  async inviteAgentCoAuthor(agent: HnAgent, emailOrId: string): Promise<boolean> {
    return this.agentCoAuthorInviteService.createUserInviteMail(agent, emailOrId);
  }

  async deleteCoAuthorInvite(inviteId: string): Promise<boolean> {
    return this.agentCoAuthorInviteService.deleteUserInvite(inviteId);
  }
}
