import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HnBrickUserInvite } from './hn-brick-user-invite.entity';
import { Repository } from 'typeorm';
import { HnBrick } from '../brick/hn-brick.entity';
import { ClStringHelper, ClSupportedLanguage } from '@monorepo/core-lib';
import { HnUser } from '../../users/hn-user.entity';
import { HnUserService } from '../../users/hn-user.service';
import { HnMailTemplate } from '../../core/model/config/hn-mail-template.class';
import { BlMailService } from '@monorepo/back-core-lib';
import { HnInviteStatus } from '../../core/model/config/hn-invite-status.enum';
import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { HnFrontService } from '../../core/service/hn-front.service';

@Injectable()
export class HnBrickUserInviteService {
  constructor(
    @InjectRepository(HnBrickUserInvite)
    private readonly brickUserInviteRepository: Repository<HnBrickUserInvite>,
    private readonly userService: HnUserService,
    private readonly frontService: HnFrontService,
    private mailService: BlMailService
  ) {}

  async createBrickUserMail(brick: HnBrick, userMail: string): Promise<boolean> {
    const brickUserMail = new HnBrickUserInvite();
    brickUserMail.brick = brick;
    brickUserMail.token = ClStringHelper.generateUUID();
    brickUserMail.email = userMail;

    const inviteMail = await this.brickUserInviteRepository.save(brickUserMail);

    const user: HnUser = await this.userService.findOneByEmail(userMail);
    let template: string;
    let lang: ClSupportedLanguage;

    const data = {
      brickTitle: brick.name,
      url: this.frontService.getBrickInviteUrl(brickUserMail.token),
      invitUser: inviteMail.createdBy,
      user: null as any,
      subscribeUrl: '',
    };

    if (user) {
      template = HnMailTemplate.brick_invite_existing_user;
      lang = user.lang;
      data.user = {
        firstname: user.firstname,
        lastname: user.lastname,
      };
    } else {
      template = HnMailTemplate.brick_invite_new_user;
      lang = inviteMail.createdBy.lang;
      data.subscribeUrl = this.frontService.getConstellabLoginUrl();
    }
    return this.mailService.sendMail({
      templateName: template,
      recipients: userMail,
      lang: lang,
      data: data,
    });
  }

  async getAndCheckInvite(token: string): Promise<HnBrickUserInvite> {
    const brickUserInvite: HnBrickUserInvite = await this.getBrickUserInviteByToken(token);
    return brickUserInvite &&
      brickUserInvite.status === HnInviteStatus.PENDING &&
      brickUserInvite.email === HnCurrentUserHelper.getCurrentUser().email
      ? brickUserInvite
      : null;
  }

  async getBrickUserInviteByToken(token: string): Promise<HnBrickUserInvite> {
    return this.brickUserInviteRepository.findOneBy({ token: token });
  }

  async acceptBrickUserInvite(brickUserInvite: HnBrickUserInvite): Promise<boolean> {
    brickUserInvite.status = HnInviteStatus.ACCEPTED;
    return (await this.brickUserInviteRepository.save(brickUserInvite)) != null;
  }

  async getBrickCoAuthorsPendingInvites(brickId: string): Promise<HnBrickUserInvite[]> {
    return this.brickUserInviteRepository.find({
      where: { brick: { id: brickId }, status: HnInviteStatus.PENDING },
    });
  }

  async deleteCoAuthorInvite(inviteId: string): Promise<boolean> {
    const invite: HnBrickUserInvite = await this.brickUserInviteRepository.findOneBy({ id: inviteId });
    if (invite == null) {
      return false;
    }
    return (await this.brickUserInviteRepository.remove(invite)) != null;
  }
}
