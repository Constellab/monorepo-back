import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HnStoryCoAuthorInvite } from './hn-story-author-invite.entity';
import { Repository } from 'typeorm';
import { HnUserService } from '../users/hn-user.service';
import { ClStringHelper, ClSupportedLanguage } from '@monorepo/core-lib';
import { HnStory } from '../story/hn-story.entity';
import { HnUser } from '../users/hn-user.entity';
import { BlMailService } from '@monorepo/back-core-lib';
import { HnMailTemplate } from '../core/model/config/hn-mail-template.class';
import { HnInviteStatus } from '../core/model/config/hn-invite-status.enum';
import { HnFrontService } from '../core/service/hn-front.service';

@Injectable()
export class HnStoryAuthorInviteService {
  constructor(
    @InjectRepository(HnStoryCoAuthorInvite)
    private readonly storyAuthorInviteRepository: Repository<HnStoryCoAuthorInvite>,
    private readonly userService: HnUserService,
    private readonly frontService: HnFrontService,
    private readonly mailService: BlMailService
  ) {}

  async createStoryAuthorMail(story: HnStory, coAuthorMail: string): Promise<boolean> {
    const storyAuthorMail = new HnStoryCoAuthorInvite();
    storyAuthorMail.story = story;
    storyAuthorMail.token = ClStringHelper.generateUUID();
    storyAuthorMail.email = coAuthorMail;

    const inviteMail = await this.storyAuthorInviteRepository.save(storyAuthorMail);

    const user: HnUser = await this.userService.findOneByEmail(coAuthorMail);
    let template: string;
    let lang: ClSupportedLanguage;

    const data = {
      storyTitle: story.title,
      url: this.frontService.getStoryInviteUrl(storyAuthorMail.token),
      invitUser: inviteMail.createdBy,
      user: null as HnUser,
      subscribeUrl: '',
    };

    if (user) {
      template = HnMailTemplate.story_invite_existing_user;
      lang = user.lang;
      data.user = user;
    } else {
      template = HnMailTemplate.story_invite_new_user;
      lang = inviteMail.createdBy.lang;
      data.subscribeUrl = this.frontService.getConstellabLoginUrl();
    }
    return this.mailService.sendMail(template, coAuthorMail, lang, data);
  }

  async getStoryAuthorInviteByToken(token: string): Promise<HnStoryCoAuthorInvite> {
    return this.storyAuthorInviteRepository.findOneBy({ token: token });
  }

  async acceptInvite(storyAuthorInvite: HnStoryCoAuthorInvite): Promise<boolean> {
    storyAuthorInvite.status = HnInviteStatus.ACCEPTED;
    return (await this.storyAuthorInviteRepository.save(storyAuthorInvite)) != null;
  }

  async getStoryCoAuthorsInvites(storyId: string): Promise<HnStoryCoAuthorInvite[]> {
    return this.storyAuthorInviteRepository.findBy({
      story: {
        id: storyId,
      },
    });
  }

  async getStoryCoAuthorsPendingInvites(storyId: string): Promise<HnStoryCoAuthorInvite[]> {
    return this.storyAuthorInviteRepository.findBy({
      story: {
        id: storyId,
      },
      status: HnInviteStatus.PENDING,
    });
  }

  async deleteCoAuthorInvite(inviteId: string): Promise<boolean> {
    const invite = await this.storyAuthorInviteRepository.findOneBy({ id: inviteId });
    if (invite == null) {
      return false;
    }
    return (await this.storyAuthorInviteRepository.remove(invite)) != null;
  }
}
