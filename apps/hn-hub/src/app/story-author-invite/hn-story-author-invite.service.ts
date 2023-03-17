import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnStoryAuthorInvite, HnStoryAuthorInviteStatus} from './hn-story-author-invite.entity';
import {Repository} from 'typeorm';
import {HnUserService} from '../users/hn-user.service';
import {ClStringHelper, ClSupportedLanguage} from '@monorepo/core-lib';
import {HnStory} from '../story/hn-story.entity';
import {HnUser} from '../users/hn-user.entity';
import {BlMailService} from '@monorepo/back-core-lib';
import {HnCoreConfigService} from '../core/modules/core-config/hn-core-config.service';
import {HnMailTemplate} from '../core/model/config/cn-mail-template.class';

@Injectable()
export class HnStoryAuthorInviteService {

  constructor(@InjectRepository(HnStoryAuthorInvite)
              private readonly storyAuthorInviteRepository: Repository<HnStoryAuthorInvite>,
              private readonly userService: HnUserService,
              private readonly coreConfigService: HnCoreConfigService,
              private readonly mailService: BlMailService
  ) {
  }

  async createStoryAuthorMail(story: HnStory, coAuthorMail: string): Promise<boolean> {
    const storyAuthorMail = new HnStoryAuthorInvite();
    storyAuthorMail.story = story;
    storyAuthorMail.token = ClStringHelper.generateUUID();
    storyAuthorMail.email = coAuthorMail;

    const inviteMail = await this.storyAuthorInviteRepository.save(storyAuthorMail);

    const user: HnUser = await this.userService.findOneByEmail(coAuthorMail);
    let template: string;
    let lang: ClSupportedLanguage;

    const data = {
      storyTitle: story.title,
      url: this.coreConfigService.getFrontRootUrl() + 'stories/invite/' + storyAuthorMail.token,
      invitUser: inviteMail.createdBy,
      user: null as HnUser,
      subscribeUrl: ''
    };

    if (user) {
      template = HnMailTemplate.story_invit_existing_user;
      lang = user.lang;
      data.user = user;
    } else {
      template = HnMailTemplate.story_invit_new_user;
      lang = inviteMail.createdBy.lang;
      data.subscribeUrl = this.coreConfigService.getConstellabFrontRootUrl() + 'login';
    }
    return this.mailService.sendMail(template, coAuthorMail, lang, data);
  }

  async getStoryAuthorInviteByToken(token: string): Promise<HnStoryAuthorInvite> {
    return this.storyAuthorInviteRepository.findOneBy({token: token});
  }

  async acceptInvite(storyAuthorInvite: HnStoryAuthorInvite): Promise<boolean> {
    storyAuthorInvite.status = HnStoryAuthorInviteStatus.ACCEPTED;
    return (await this.storyAuthorInviteRepository.save(storyAuthorInvite)) != null;
  }

}
