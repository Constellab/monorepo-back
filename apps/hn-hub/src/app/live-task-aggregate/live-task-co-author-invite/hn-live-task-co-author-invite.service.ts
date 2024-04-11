import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnLiveTaskCoAuthorInvite} from './hn-live-task-co-author-invite.entity';
import {HnLiveTask} from '../live-task/hn-live-task.entity';
import {ClStringHelper, ClSupportedLanguage} from '@monorepo/core-lib';
import {HnUser} from '../../users/hn-user.entity';
import {HnMailTemplate} from '../../core/model/config/hn-mail-template.class';
import {HnInviteStatus} from '../../core/model/config/hn-invite-status.enum';
import {HnUserService} from '../../users/hn-user.service';
import {HnFrontService} from '../../core/service/hn-front.service';
import {BlMailService} from '@monorepo/back-core-lib';

@Injectable()
export class HnLiveTaskCoAuthorInviteService {
  constructor(
    @InjectRepository(HnLiveTaskCoAuthorInvite)
    private liveTaskCoAuthorInviteRepository: Repository<HnLiveTaskCoAuthorInvite>,
    private userService: HnUserService,
    private frontService: HnFrontService,
    private mailService: BlMailService
  ) {
  }

  async createLiveTaskCoAuthorMail(liveTask: HnLiveTask, coAuthorMail: string): Promise<boolean> {
    const liveTaskCoAuthorMail = new HnLiveTaskCoAuthorInvite();
    liveTaskCoAuthorMail.liveTask = liveTask;
    liveTaskCoAuthorMail.token = ClStringHelper.generateUUID();
    liveTaskCoAuthorMail.email = coAuthorMail;

    const inviteMail = await this.liveTaskCoAuthorInviteRepository.save(liveTaskCoAuthorMail);

    const user: HnUser = await this.userService.findOneByEmail(coAuthorMail);
    let template: string;
    let lang: ClSupportedLanguage;

    const data = {
      liveTaskTitle: liveTask.title,
      url: this.frontService.getLiveTaskInviteUrl(liveTaskCoAuthorMail.token),
      invitUser: inviteMail.createdBy,
      user: null as HnUser,
      subscribeUrl: ''
    };

    if (user) {
      template = HnMailTemplate.live_task_invite_existing_user;
      lang = user.lang;
      data.user = user;
    } else {
      template = HnMailTemplate.live_task_invite_new_user;
      lang = inviteMail.createdBy.lang;
      data.subscribeUrl = this.frontService.getConstellabLoginUrl();
    }
    return this.mailService.sendMail(template, coAuthorMail, lang, data);
  }

  async getLiveTaskCoAuthorInviteByToken(token: string): Promise<HnLiveTaskCoAuthorInvite> {
    return this.liveTaskCoAuthorInviteRepository.findOneBy({token: token});
  }

  async acceptInvite(liveTaskCoAuthorInvite: HnLiveTaskCoAuthorInvite): Promise<boolean> {
    liveTaskCoAuthorInvite.status = HnInviteStatus.ACCEPTED;
    return (await this.liveTaskCoAuthorInviteRepository.save(liveTaskCoAuthorInvite)) != null;
  }

  async getLiveTaskCoAuthorsInvites(liveTaskId: string): Promise<HnLiveTaskCoAuthorInvite[]> {
    return this.liveTaskCoAuthorInviteRepository.findBy({
      liveTask: {
        id: liveTaskId
      }
    });
  }

  async getLiveTaskCoAuthorsPendingInvites(liveTaskId: string): Promise<HnLiveTaskCoAuthorInvite[]>{
    return this.liveTaskCoAuthorInviteRepository.findBy({
      liveTask: {
        id: liveTaskId
      },
      status: HnInviteStatus.PENDING
    });
  }

  async deleteCoAuthorInvite(inviteId: string): Promise<boolean>{
    const invite = await this.liveTaskCoAuthorInviteRepository.findOneBy({id: inviteId});
    if(invite == null){
      return false;
    }
    return await this.liveTaskCoAuthorInviteRepository.remove(invite) != null;
  }

}
