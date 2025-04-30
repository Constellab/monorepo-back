import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HnAgentCoAuthorInvite } from './hn-agent-co-author-invite.entity';
import { HnAgent } from '../agent/hn-agent.entity';
import { ClStringHelper, ClSupportedLanguage } from '@monorepo/core-lib';
import { HnUser } from '../../users/hn-user.entity';
import { HnMailTemplate } from '../../core/model/config/hn-mail-template.class';
import { HnInviteStatus } from '../../core/model/config/hn-invite-status.enum';
import { HnUserService } from '../../users/hn-user.service';
import { HnFrontService } from '../../core/service/hn-front.service';
import { BlMailService } from '@monorepo/back-core-lib';

@Injectable()
export class HnAgentCoAuthorInviteService {
  constructor(
    @InjectRepository(HnAgentCoAuthorInvite)
    private agentCoAuthorInviteRepository: Repository<HnAgentCoAuthorInvite>,
    private userService: HnUserService,
    private frontService: HnFrontService,
    private mailService: BlMailService
  ) {}

  async createAgentCoAuthorMail(agent: HnAgent, coAuthorMail: string): Promise<boolean> {
    const agentCoAuthorInvite = new HnAgentCoAuthorInvite();
    agentCoAuthorInvite.agent = agent;
    agentCoAuthorInvite.token = ClStringHelper.generateUUID();
    agentCoAuthorInvite.email = coAuthorMail;

    const inviteMail = await this.agentCoAuthorInviteRepository.save(agentCoAuthorInvite);

    const user: HnUser = await this.userService.findOneByEmail(coAuthorMail);
    let template: string;
    let lang: ClSupportedLanguage;

    const data = {
      agentTitle: agent.title,
      url: this.frontService.getAgentInviteUrl(agentCoAuthorInvite.token),
      invitUser: inviteMail.createdBy,
      user: null as any,
      subscribeUrl: '',
    };

    if (user) {
      template = HnMailTemplate.agent_invite_existing_user;
      lang = user.lang;
      data.user = {
        firstname: user.firstname,
        lastname: user.lastname,
      };
    } else {
      template = HnMailTemplate.agent_invite_new_user;
      lang = inviteMail.createdBy.lang;
      data.subscribeUrl = this.frontService.getConstellabLoginUrl();
    }
    return await this.mailService.sendMail({
      templateName: template,
      recipients: coAuthorMail,
      lang: lang,
      data: data,
    });
  }

  async getAgentCoAuthorInviteByToken(token: string): Promise<HnAgentCoAuthorInvite> {
    return this.agentCoAuthorInviteRepository.findOneBy({ token: token });
  }

  async acceptInvite(agentCoAuthorInvite: HnAgentCoAuthorInvite): Promise<boolean> {
    agentCoAuthorInvite.status = HnInviteStatus.ACCEPTED;
    return (await this.agentCoAuthorInviteRepository.save(agentCoAuthorInvite)) != null;
  }

  async getAgentCoAuthorsInvites(agentId: string): Promise<HnAgentCoAuthorInvite[]> {
    return this.agentCoAuthorInviteRepository.findBy({
      agent: {
        id: agentId,
      },
    });
  }

  async getAgentCoAuthorsPendingInvites(agentId: string): Promise<HnAgentCoAuthorInvite[]> {
    return this.agentCoAuthorInviteRepository.findBy({
      agent: {
        id: agentId,
      },
      status: HnInviteStatus.PENDING,
    });
  }

  async deleteCoAuthorInvite(inviteId: string): Promise<boolean> {
    const invite = await this.agentCoAuthorInviteRepository.findOneBy({ id: inviteId });
    if (invite == null) {
      return false;
    }
    return (await this.agentCoAuthorInviteRepository.remove(invite)) != null;
  }
}
