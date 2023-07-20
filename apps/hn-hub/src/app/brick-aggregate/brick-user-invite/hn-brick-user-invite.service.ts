import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnBrickUserInvite} from './hn-brick-user-invite.entity';
import {Repository} from 'typeorm';
import {HnBrick} from '../brick/hn-brick.entity';
import {ClStringHelper, ClSupportedLanguage} from '@monorepo/core-lib';
import {HnUser} from '../../users/hn-user.entity';
import {HnUserService} from '../../users/hn-user.service';
import {HnMailTemplate} from '../../core/model/config/hn-mail-template.class';
import {BlMailService} from '@monorepo/back-core-lib';
import {HnInviteStatus} from '../../core/model/config/hn-invite-status.enum';
import {HnCurrentUserHelper} from '../../core/utils/hn-current-user.helper';
import {HnFrontService} from '../../core/service/hn-front.service';

@Injectable()
export class HnBrickUserInviteService {
  constructor(@InjectRepository(HnBrickUserInvite) private readonly brickUserInviteRepository: Repository<HnBrickUserInvite>,
              private readonly userService: HnUserService,
              private readonly frontService: HnFrontService,
              private mailService: BlMailService) {
  }

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
      user: null as HnUser,
      subscribeUrl: ''
    };

    if (user) {
      template = HnMailTemplate.brick_invit_existing_user;
      lang = user.lang;
      data.user = user;
    } else {
      template = HnMailTemplate.brick_invit_new_user;
      lang = inviteMail.createdBy.lang;
      data.subscribeUrl = this.frontService.getConstellabLoginUrl();
    }
    return this.mailService.sendMail(template, userMail, lang, data);
  }

  async getAndCheckInvite(token: string): Promise<HnBrickUserInvite> {
    const brickUserInvite: HnBrickUserInvite = await this.getBrickUserInviteByToken(token);
    return (brickUserInvite && brickUserInvite.status === HnInviteStatus.PENDING &&
      brickUserInvite.email === HnCurrentUserHelper.getCurrentUser().email) ? brickUserInvite : null;
  }

  async getBrickUserInviteByToken(token: string): Promise<HnBrickUserInvite> {
    return this.brickUserInviteRepository.findOneBy({token: token});
  }

  async acceptBrickUserInvite(brickUserInvite: HnBrickUserInvite): Promise<boolean> {
    brickUserInvite.status = HnInviteStatus.ACCEPTED;
    return (await this.brickUserInviteRepository.save(brickUserInvite)) != null;
  }
}
