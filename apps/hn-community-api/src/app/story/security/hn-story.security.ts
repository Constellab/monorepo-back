import { Injectable } from '@nestjs/common';

import { HnCommunitySecurity } from '../../core/security/hn-community-security.service';
import { HnStoryAuthorService } from '../../story-author/hn-story-author.service';
import { HnUser } from '../../users/hn-user.entity';
import { HnStory } from '../hn-story.entity';

@Injectable()
export class HnStorySecurity {
  constructor(
    private communitySecurity: HnCommunitySecurity,
    private storyAuthorService: HnStoryAuthorService
  ) {}

  async assertCanEdit(story: HnStory, user: HnUser): Promise<void> {
    if (user.isAdmin()) return;

    const coAuthors = await this.storyAuthorService.getStoryCoAuthorsByStoryId(story.id);
    this.communitySecurity.assertIsCreatorOrCoAuthor(story, coAuthors, user.id);
  }

  assertIsCreator(story: HnStory, user: HnUser): void {
    if (user.isAdmin()) return;

    this.communitySecurity.assertIsCreator(story, user.id);
  }

  async isCreatorOrCoAuthor(story: HnStory, user: HnUser): Promise<boolean> {
    if (!user) return false;
    if (user.isAdmin()) return true;
    if (this.communitySecurity.isCreator(story, user.id)) return true;

    const coAuthors = await this.storyAuthorService.getStoryCoAuthorsByStoryId(story.id);
    return this.communitySecurity.isCoAuthor(coAuthors, user.id);
  }
}
