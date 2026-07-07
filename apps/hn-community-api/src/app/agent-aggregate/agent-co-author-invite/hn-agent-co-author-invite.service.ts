import { BlMailService } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnInviteStatus } from '../../core/model/config/hn-invite-status.enum';
import { HnMailTemplate } from '../../core/model/config/hn-mail-template.class';
import { HnAbstractUserInviteService } from '../../core/service/hn-abstract-user-invite.service';
import { HnFrontService } from '../../core/service/hn-front.service';
import { HnUserService } from '../../users/hn-user.service';
import { HnAgent } from '../agent/hn-agent.entity';
import { HnAgentCoAuthorInvite } from './hn-agent-co-author-invite.entity';

@Injectable()
export class HnAgentCoAuthorInviteService extends HnAbstractUserInviteService<
  HnAgentCoAuthorInvite,
  HnAgent
> {
  constructor(
    @InjectRepository(HnAgentCoAuthorInvite)
    private agentCoAuthorInviteRepository: Repository<HnAgentCoAuthorInvite>,
    userService: HnUserService,
    frontService: HnFrontService,
    mailService: BlMailService
  ) {
    super(agentCoAuthorInviteRepository, userService, frontService, mailService);
  }

  protected async getPendingUserInvites(agentId: string): Promise<HnAgentCoAuthorInvite[]> {
    return this.agentCoAuthorInviteRepository.findBy({
      agent: {
        id: agentId,
      },
      status: HnInviteStatus.PENDING,
    });
  }

  protected initNewUserInvite(entity: HnAgent): HnAgentCoAuthorInvite {
    const agentUserInvite = new HnAgentCoAuthorInvite();
    agentUserInvite.agent = entity;
    return agentUserInvite;
  }

  protected getInviteEntityTitle(entity: HnAgent): string {
    return entity.title;
  }

  protected getFrontInviteUrl(token: string): string {
    return this.frontService.getAgentInviteUrl(token);
  }

  protected getExistingUserInviteMailTemplate(): string {
    return HnMailTemplate.agent_invite_existing_user;
  }

  protected getNewUserInviteMailTemplate(): string {
    return HnMailTemplate.agent_invite_new_user;
  }
}
