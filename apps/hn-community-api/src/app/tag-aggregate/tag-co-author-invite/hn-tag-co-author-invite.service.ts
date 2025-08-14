import { BlMailService } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnInviteStatus } from '../../core/model/config/hn-invite-status.enum';
import { HnFrontService } from '../../core/service/hn-front.service';
import { HnAbstractUserInviteService } from '../../core/service/hn-abstract-user-invite.service';
import { HnUserService } from '../../users/hn-user.service';
import { HnTagKey } from '../tag-key/hn-tag-key.entity';
import { HnTagCoAuthorInvite } from './hn-tag-co-author-invite.entity';
import { HnMailTemplate } from '../../core/model/config/hn-mail-template.class';

@Injectable()
export class HnTagCoAuthorInviteService extends HnAbstractUserInviteService<HnTagCoAuthorInvite, HnTagKey> {
  constructor(
    @InjectRepository(HnTagCoAuthorInvite)
    private tagCoAuthorInviteRepository: Repository<HnTagCoAuthorInvite>,
    userService: HnUserService,
    frontService: HnFrontService,
    mailService: BlMailService
  ) {
    super(tagCoAuthorInviteRepository, userService, frontService, mailService);
  }

  async getTagCoAuthorInviteByToken(token: string): Promise<HnTagCoAuthorInvite> {
    return this.tagCoAuthorInviteRepository.findOne({ where: { token } });
  }

  async acceptInvite(tagCoAuthorInvite: HnTagCoAuthorInvite): Promise<boolean> {
    tagCoAuthorInvite.status = HnInviteStatus.ACCEPTED;
    return (await this.tagCoAuthorInviteRepository.save(tagCoAuthorInvite)) != null;
  }

  async getTagCoAuthorsInvites(tagKeyId: string): Promise<HnTagCoAuthorInvite[]> {
    return this.tagCoAuthorInviteRepository.find({ where: { tagKey: { id: tagKeyId } } });
  }

  protected async getPendingUserInvites(tagKeyId: string): Promise<HnTagCoAuthorInvite[]> {
    return this.tagCoAuthorInviteRepository.find({
      where: { tagKey: { id: tagKeyId }, status: HnInviteStatus.PENDING },
    });
  }

  protected initNewUserInvite(entity: HnTagKey): HnTagCoAuthorInvite {
    const tagCoAuthor = new HnTagCoAuthorInvite();
    tagCoAuthor.tagKey = entity;
    return tagCoAuthor;
  }

  protected getInviteEntityTitle(entity: HnTagKey): string {
    return entity.label;
  }

  protected getFrontInviteUrl(token: string): string {
    return this.frontService.getTagInviteUrl(token);
  }

  protected getExistingUserInviteMailTemplate(): string {
    return HnMailTemplate.tag_invite_existing_user;
  }

  protected getNewUserInviteMailTemplate(): string {
    return HnMailTemplate.tag_invite_new_user;
  }
}
