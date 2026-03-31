import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';

import { HnCommunitySecurity } from '../../core/security/hn-community-security.service';
import { HnUser } from '../../users/hn-user.entity';
import { HnTagKey } from '../tag-key/hn-tag-key.entity';

@Injectable()
export class HnTagSecurity {
  constructor(private communitySecurity: HnCommunitySecurity) {}

  async assertCanEdit(tagKey: HnTagKey, user: HnUser): Promise<void> {
    if (!user) {
      throw new BlUnauthorizedException('You must be logged in to edit a tag key');
    }
    await this.communitySecurity.assertSpaceMembership(tagKey, user.id);
    this.communitySecurity.assertIsCreatorOrCoAuthor(tagKey, tagKey.tagCoAuthors, user.id);
  }
}
