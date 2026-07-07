import { BlMailService } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnInviteStatus } from '../core/model/config/hn-invite-status.enum';
import { HnMailTemplate } from '../core/model/config/hn-mail-template.class';
import { HnAbstractUserInviteService } from '../core/service/hn-abstract-user-invite.service';
import { HnFrontService } from '../core/service/hn-front.service';
import { HnStory } from '../story/hn-story.entity';
import { HnUserService } from '../users/hn-user.service';
import { HnStoryCoAuthorInvite } from './hn-story-author-invite.entity';

@Injectable()
export class HnStoryAuthorInviteService extends HnAbstractUserInviteService<HnStoryCoAuthorInvite, HnStory> {
  constructor(
    @InjectRepository(HnStoryCoAuthorInvite)
    private readonly storyAuthorInviteRepository: Repository<HnStoryCoAuthorInvite>,
    userService: HnUserService,
    frontService: HnFrontService,
    mailService: BlMailService
  ) {
    super(storyAuthorInviteRepository, userService, frontService, mailService);
  }

  async getStoryCoAuthorsInvites(storyId: string): Promise<HnStoryCoAuthorInvite[]> {
    return this.storyAuthorInviteRepository.findBy({
      story: {
        id: storyId,
      },
    });
  }

  protected async getPendingUserInvites(storyId: string): Promise<HnStoryCoAuthorInvite[]> {
    return this.storyAuthorInviteRepository.findBy({
      story: {
        id: storyId,
      },
      status: HnInviteStatus.PENDING,
    });
  }

  protected initNewUserInvite(entity: HnStory): HnStoryCoAuthorInvite {
    const storyAuthorMail = new HnStoryCoAuthorInvite();
    storyAuthorMail.story = entity;
    return storyAuthorMail;
  }

  protected getInviteEntityTitle(entity: HnStory): string {
    return entity.title;
  }

  protected getFrontInviteUrl(token: string): string {
    return this.frontService.getStoryInviteUrl(token);
  }

  protected getExistingUserInviteMailTemplate(): string {
    return HnMailTemplate.story_invite_existing_user;
  }

  protected getNewUserInviteMailTemplate(): string {
    return HnMailTemplate.story_invite_new_user;
  }
}
