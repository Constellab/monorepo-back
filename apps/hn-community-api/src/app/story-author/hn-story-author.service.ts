import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnStory } from '../story/hn-story.entity';
import { HnStoryCoAuthorInvite } from '../story-author-invite/hn-story-author-invite.entity';
import { HnStoryAuthorInviteService } from '../story-author-invite/hn-story-author-invite.service';
import { HnStoryCoAuthor } from './hn-story-author.entity';

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
    const storyAuthor: HnStoryCoAuthor | null = await this.storyAuthorRepository.findOneBy({
      story: { id: storyId },
      user: { id: storyAuthorUserId },
    });
    if (storyAuthor) {
      await this.storyAuthorRepository.remove(storyAuthor);
    }
  }

  async getStoryAuthorInviteByToken(token: string): Promise<HnStoryCoAuthorInvite> {
    return this.storyAuthorInviteService.getAndCheckInvite(token);
  }

  async acceptInvite(
    storyAuthor: HnStoryCoAuthor,
    storyAuthorInvite: HnStoryCoAuthorInvite
  ): Promise<boolean> {
    return (
      (await this.storyAuthorInviteService.acceptUserInvite(storyAuthorInvite)) != null &&
      (await this.storyAuthorRepository.save(storyAuthor)) != null
    );
  }

  async getStoryCoAuthorsInvites(storyId: string): Promise<HnStoryCoAuthorInvite[]> {
    return this.storyAuthorInviteService.getStoryCoAuthorsInvites(storyId);
  }

  async getStoryCoAuthorsPendingInvites(storyId: string): Promise<HnStoryCoAuthorInvite[]> {
    return this.storyAuthorInviteService.getPendingUserInvitesWithUser(storyId);
  }

  async inviteStoryCoAuthor(story: HnStory, emailOrId: string): Promise<boolean> {
    return this.storyAuthorInviteService.createUserInviteMail(story, emailOrId);
  }

  async deleteCoAuthorInvite(inviteId: string): Promise<boolean> {
    return this.storyAuthorInviteService.deleteUserInvite(inviteId);
  }
}
