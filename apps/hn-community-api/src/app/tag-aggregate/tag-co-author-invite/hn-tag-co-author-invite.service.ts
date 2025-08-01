import { BlMailService } from '@monorepo/back-core-lib';
import { ClStringHelper, ClSupportedLanguage } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnInviteStatus } from '../../core/model/config/hn-invite-status.enum';
import { HnMailTemplate } from '../../core/model/config/hn-mail-template.class';
import { HnFrontService } from '../../core/service/hn-front.service';
import { HnUserService } from '../../users/hn-user.service';
import { HnTagKey } from '../tag-key/hn-tag-key.entity';
import { HnTagCoAuthorInvite } from './hn-tag-co-author-invite.entity';

@Injectable()
export class HnTagCoAuthorInviteService {
  constructor(
    @InjectRepository(HnTagCoAuthorInvite)
    private tagCoAuthorInviteRepository: Repository<HnTagCoAuthorInvite>,
    private userService: HnUserService,
    private frontService: HnFrontService,
    private mailService: BlMailService
  ) {}

  async createTagCoAuthorMail(tagKey: HnTagKey, coAuthorMail: string): Promise<boolean> {
    const tagCoAuthorInvite = new HnTagCoAuthorInvite();
    tagCoAuthorInvite.tagKey = tagKey;
    tagCoAuthorInvite.token = ClStringHelper.generateUUID();
    tagCoAuthorInvite.email = coAuthorMail;

    const inviteMail = await this.tagCoAuthorInviteRepository.save(tagCoAuthorInvite);

    const user = await this.userService.findOneByEmail(coAuthorMail);
    let template: string;
    let lang: ClSupportedLanguage;

    const data = {
      tagKeyLabel: tagKey.label,
      url: this.frontService.getTagInviteUrl(tagCoAuthorInvite.token),
      invitUser: inviteMail.createdBy,
      user: null as any,
      subscribeUrl: '',
    };

    if (user) {
      template = HnMailTemplate.tag_invite_existing_user;
      lang = user.lang;
      data.user = {
        firstname: user.firstname,
        lastname: user.lastname,
      };
    } else {
      template = HnMailTemplate.tag_invite_new_user;
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

  async getTagCoAuthorsPendingInvites(tagKeyId: string): Promise<HnTagCoAuthorInvite[]> {
    return this.tagCoAuthorInviteRepository.find({
      where: { tagKey: { id: tagKeyId }, status: HnInviteStatus.PENDING },
    });
  }

  async deleteCoAuthorInvite(inviteId: string): Promise<boolean> {
    const invite = await this.tagCoAuthorInviteRepository.findOneBy({ id: inviteId });
    if (!invite) {
      return false;
    }
    return (await this.tagCoAuthorInviteRepository.remove(invite)) != null;
  }
}
