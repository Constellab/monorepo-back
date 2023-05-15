import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnStoryAuthor} from './hn-story-author.entity';
import {Repository} from 'typeorm';
import {HnUserService} from '../users/hn-user.service';
import {HnUser} from '../users/hn-user.entity';
import {HnStory} from '../story/hn-story.entity';
import {HnStoryAuthorInviteService} from '../story-author-invite/hn-story-author-invite.service';
import {HnStoryAuthorInvite} from '../story-author-invite/hn-story-author-invite.entity';

@Injectable()
export class HnStoryAuthorService {
  constructor(@InjectRepository(HnStoryAuthor)
              private readonly storyAuthorRepository: Repository<HnStoryAuthor>,
              private readonly userService: HnUserService,
              private readonly storyAuthorInviteService: HnStoryAuthorInviteService
  ) {
  }

  createStoryAuthor(story: HnStory, author: HnUser): Promise<HnStoryAuthor> {
    const storyAuthor = new HnStoryAuthor();
    storyAuthor.initAuthor(story, author);
    return this.storyAuthorRepository.save(storyAuthor);
  }

  async updateStoryCoAuthors(story: HnStory, coAuthorsMail: string[]): Promise<void> {
    for (const coAuthorMail of coAuthorsMail) {
      await this.storyAuthorInviteService.createStoryAuthorMail(story, coAuthorMail);
    }
  }

  async removeStoryCoAuthor(storyAuthorId: string): Promise<void> {
    const storyAuthor: HnStoryAuthor = await this.storyAuthorRepository.findOneBy({id: storyAuthorId});
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
}
