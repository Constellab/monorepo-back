import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnLiveTaskCoAuthor} from './hn-live-task-co-author.entity';
import {HnLiveTaskCoAuthorInvite} from '../live-task-co-author-invite/hn-live-task-co-author-invite.entity';
import {HnLiveTaskCoAuthorInviteService} from '../live-task-co-author-invite/hn-live-task-co-author-invite.service';
import {HnLiveTask} from '../live-task/hn-live-task.entity';

@Injectable()
export class HnLiveTaskCoAuthorService {
  constructor(
    @InjectRepository(HnLiveTaskCoAuthor)
    private liveTaskCoAuthorRepository: Repository<HnLiveTaskCoAuthor>,
    private liveTaskCoAuthorInviteService: HnLiveTaskCoAuthorInviteService
  ) {
  }

  async getLiveTaskCoAuthorsByLiveTaskId(liveTaskId: string): Promise<HnLiveTaskCoAuthor[]> {
    return this.liveTaskCoAuthorRepository.find({where: {liveTask: {id: liveTaskId}}});
  }

  async getLiveTaskCoAuthorsByUserId(userId: string): Promise<HnLiveTaskCoAuthor[]> {
    return this.liveTaskCoAuthorRepository.find({where: {user: {id: userId}}, relations: ['liveTask']});
  }

  async removeLiveTaskCoAuthor(liveTaskId: string, liveTaskCoAuthorUserId: string): Promise<void> {
    const liveTaskCoAuthor: HnLiveTaskCoAuthor = await this.liveTaskCoAuthorRepository.findOneBy(
      {
        liveTask: {id: liveTaskId},
        user: {id: liveTaskCoAuthorUserId}
      }
    );
    if (liveTaskCoAuthor) {
      await this.liveTaskCoAuthorRepository.remove(liveTaskCoAuthor);
    }
  }

  async getLiveTaskCoAuthorInviteByToken(token: string): Promise<HnLiveTaskCoAuthorInvite> {
    return this.liveTaskCoAuthorInviteService.getLiveTaskCoAuthorInviteByToken(token);
  }

  async acceptInvite(liveTaskCoAuthor: HnLiveTaskCoAuthor, liveTaskCoAuthorInvite: HnLiveTaskCoAuthorInvite): Promise<boolean> {
    return (await this.liveTaskCoAuthorInviteService.acceptInvite(liveTaskCoAuthorInvite)) != null
      && (await this.liveTaskCoAuthorRepository.save(liveTaskCoAuthor)) != null;
  }

  async getLiveTaskCoAuthorsInvites(liveTaskId: string): Promise<HnLiveTaskCoAuthorInvite[]> {
    return this.liveTaskCoAuthorInviteService.getLiveTaskCoAuthorsInvites(liveTaskId);
  }

  async getLiveTaskCoAuthorsPendingInvites(liveTaskId: string): Promise<HnLiveTaskCoAuthorInvite[]> {
    return this.liveTaskCoAuthorInviteService.getLiveTaskCoAuthorsPendingInvites(liveTaskId);
  }

  async inviteLiveTaskCoAuthor(liveTask: HnLiveTask, coAuthorMail: string): Promise<boolean> {
    return this.liveTaskCoAuthorInviteService.createLiveTaskCoAuthorMail(liveTask, coAuthorMail);
  }

  async deleteCoAuthorInvite(inviteId: string): Promise<boolean> {
    return this.liveTaskCoAuthorInviteService.deleteCoAuthorInvite(inviteId);
  }
}
