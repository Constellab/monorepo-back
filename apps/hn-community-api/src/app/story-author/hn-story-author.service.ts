import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HnStoryCoAuthor } from './hn-story-author.entity';
import { Repository } from 'typeorm';
import { HnStory } from '../story/hn-story.entity';
import { HnStoryAuthorInviteService } from '../story-author-invite/hn-story-author-invite.service';
import { HnStoryCoAuthorInvite } from '../story-author-invite/hn-story-author-invite.entity';

@Injectable()
export class HnStoryAuthorService {
  constructor(
    @InjectRepository(HnStoryCoAuthor)
    private readonly storyAuthorRepository: Repository<HnStoryCoAuthor>,
    private readonly storyAuthorInviteService: HnStoryAuthorInviteService
  ) {}

  async getStoryCoAuthorsByStoryId(storyId: string): Promise<HnStoryCoAuthor[]> {
    return this.storyAuthorRepository.find({ where: { story: { id: storyId } } });
  }

  async removeStoryCoAuthor(storyId: string, storyAuthorUserId: string): Promise<void> {
    const storyAuthor: HnStoryCoAuthor = await this.storyAuthorRepository.findOneBy({
      story: { id: storyId },
      user: { id: storyAuthorUserId },
    });
    if (storyAuthor) {
      await this.storyAuthorRepository.remove(storyAuthor);
    }
  }

  async getStoryAuthorInviteByToken(token: string): Promise<HnStoryCoAuthorInvite> {
    return this.storyAuthorInviteService.getStoryAuthorInviteByToken(token);
  }

  async acceptInvite(
    storyAuthor: HnStoryCoAuthor,
    storyAuthorInvite: HnStoryCoAuthorInvite
  ): Promise<boolean> {
    return (
      (await this.storyAuthorInviteService.acceptInvite(storyAuthorInvite)) != null &&
      (await this.storyAuthorRepository.save(storyAuthor)) != null
    );
  }

  async getStoryCoAuthorsInvites(storyId: string): Promise<HnStoryCoAuthorInvite[]> {
    return this.storyAuthorInviteService.getStoryCoAuthorsInvites(storyId);
  }

  async getStoryCoAuthorsPendingInvites(storyId: string): Promise<HnStoryCoAuthorInvite[]> {
    return this.storyAuthorInviteService.getStoryCoAuthorsPendingInvites(storyId);
  }

  async inviteStoryCoAuthor(story: HnStory, coAuthorMail: string): Promise<boolean> {
    return this.storyAuthorInviteService.createStoryAuthorMail(story, coAuthorMail);
  }

  async deleteCoAuthorInvite(inviteId: string): Promise<boolean> {
    return this.storyAuthorInviteService.deleteCoAuthorInvite(inviteId);
  }
}
