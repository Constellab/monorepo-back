import { BlMailService } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnInviteStatus } from '../../core/model/config/hn-invite-status.enum';
import { HnAbstractUserInviteService } from '../../core/service/hn-abstract-user-invite.service';
import { HnFrontService } from '../../core/service/hn-front.service';
import { HnUserService } from '../../users/hn-user.service';
import { HnCommunityApp } from '../community-app/hn-community-app.entity';
import { HnCommunityAppCoAuthorInvite } from './hn-community-app-co-author-invite.entity';
import { HnMailTemplate } from '../../core/model/config/hn-mail-template.class';

@Injectable()
export class HnCommunityAppCoAuthorInviteService extends HnAbstractUserInviteService<
  HnCommunityAppCoAuthorInvite,
  HnCommunityApp
> {
  constructor(
    @InjectRepository(HnCommunityAppCoAuthorInvite)
    private communityAppCoAuthorInviteRepository: Repository<HnCommunityAppCoAuthorInvite>,
    userService: HnUserService,
    frontService: HnFrontService,
    mailService: BlMailService
  ) {
    super(communityAppCoAuthorInviteRepository, userService, frontService, mailService);
  }

  protected async getPendingUserInvites(communityAppId: string): Promise<HnCommunityAppCoAuthorInvite[]> {
    return this.communityAppCoAuthorInviteRepository.findBy({
      communityApp: {
        id: communityAppId,
      },
      status: HnInviteStatus.PENDING,
    });
  }

  protected initNewUserInvite(entity: HnCommunityApp): HnCommunityAppCoAuthorInvite {
    const communityAppUserInvite = new HnCommunityAppCoAuthorInvite();
    communityAppUserInvite.communityApp = entity;
    return communityAppUserInvite;
  }

  protected getInviteEntityTitle(entity: HnCommunityApp): string {
    return entity.title;
  }

  protected getFrontInviteUrl(token: string): string {
    return this.frontService.getAppInviteUrl(token);
  }

  protected getExistingUserInviteMailTemplate(): string {
    return HnMailTemplate.app_invite_existing_user;
  }

  protected getNewUserInviteMailTemplate(): string {
    return HnMailTemplate.app_invite_new_user;
  }
}
