import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnStoryAuthor} from './hn-story-author.entity';
import {Repository} from 'typeorm';
import {HnStory} from '../story/hn-story.entity';
import {HnStoryAuthorInviteService} from '../story-author-invite/hn-story-author-invite.service';
import {HnStoryAuthorInvite} from '../story-author-invite/hn-story-author-invite.entity';

@Injectable()
export class HnStoryAuthorService {
  constructor(@InjectRepository(HnStoryAuthor)
              private readonly storyAuthorRepository: Repository<HnStoryAuthor>,
              private readonly storyAuthorInviteService: HnStoryAuthorInviteService
  ) {
  }


  async getStoryCoAuthorsByStoryId(storyId: string): Promise<HnStoryAuthor[]> {
    return this.storyAuthorRepository.find({where: {story: {id: storyId}}});
  }

  async removeStoryCoAuthor(storyId: string, storyAuthorUserId: string): Promise<void> {
    const storyAuthor: HnStoryAuthor = await this.storyAuthorRepository.findOneBy(
      {
        story: {id: storyId},
        user: {id: storyAuthorUserId}
      }
    );
    if (storyAuthor) {
      await this.storyAuthorRepository.remove(storyAuthor);
    }
  }

  async getStoryAuthorInviteByToken(token: string): Promise<HnStoryAuthorInvite> {
    return this.storyAuthorInviteService.getStoryAuthorInviteByToken(token);
  }

  async acceptInvite(storyAuthor: HnStoryAuthor, storyAuthorInvite: HnStoryAuthorInvite): Promise<boolean> {
    return (await this.storyAuthorInviteService.acceptInvite(storyAuthorInvite)) != null
      && (await this.storyAuthorRepository.save(storyAuthor)) != null;
  }

  async getStoryCoAuthorsInvites(storyId: string): Promise<HnStoryAuthorInvite[]> {
    return this.storyAuthorInviteService.getStoryCoAuthorsInvites(storyId);
  }

  async getStoryCoAuthorsPendingInvites(storyId: string): Promise<HnStoryAuthorInvite[]> {
    return this.storyAuthorInviteService.getStoryCoAuthorsPendingInvites(storyId);
  }

  async inviteStoryCoAuthor(story: HnStory, coAuthorMail: string): Promise<boolean> {
    return this.storyAuthorInviteService.createStoryAuthorMail(story, coAuthorMail);
  }

  async deleteCoAuthorInvite(inviteId: string): Promise<boolean> {
    return this.storyAuthorInviteService.deleteCoAuthorInvite(inviteId);
  }
}
