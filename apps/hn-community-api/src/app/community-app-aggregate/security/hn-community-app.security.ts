import { Injectable } from '@nestjs/common';

import { HnCommunitySecurity } from '../../core/security/hn-community-security.service';
import { HnUser } from '../../users/hn-user.entity';
import { HnCommunityApp } from '../community-app/hn-community-app.entity';
import { HnCommunityAppCoAuthorService } from '../community-app-co-author/hn-community-app-co-author.service';

@Injectable()
export class HnCommunityAppSecurity {
  constructor(
    private communitySecurity: HnCommunitySecurity,
    private communityAppCoAuthorService: HnCommunityAppCoAuthorService
  ) {}

  async assertCanEdit(app: HnCommunityApp, user: HnUser): Promise<void> {
    await this.communitySecurity.assertSpaceMembership(app, user.id);
    const coAuthors =
      await this.communityAppCoAuthorService.getCommunityAppCoAuthorsByCommunityAppId(app.id);
    this.communitySecurity.assertIsCreatorOrCoAuthor(app, coAuthors, user.id);
  }

  assertIsCreator(app: HnCommunityApp, user: HnUser): void {
    this.communitySecurity.assertIsCreator(app, user.id);
  }

  async assertCanView(app: HnCommunityApp, user: HnUser): Promise<void> {
    await this.communitySecurity.assertSpaceMembership(app, user.id);
  }
}
