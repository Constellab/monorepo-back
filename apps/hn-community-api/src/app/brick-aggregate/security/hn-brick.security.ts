import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';

import { HnCommunitySecurity } from '../../core/security/hn-community-security.service';
import { HnSpaceUserService } from '../../space-aggregate/space-user/hn-space-user.service';
import { HnUser } from '../../users/hn-user.entity';
import { HnBrick } from '../brick/hn-brick.entity';

@Injectable()
export class HnBrickSecurity {
  constructor(
    private communitySecurity: HnCommunitySecurity,
    private spaceUserService: HnSpaceUserService
  ) {}

  async canEdit(brick: HnBrick, user: HnUser, fullRight = true): Promise<boolean> {
    if (!user) return false;
    if (user.isAdmin()) return true;

    const isCreator = this.communitySecurity.isCreator(brick, user.id);
    const isCoAuthor = this.communitySecurity.isCoAuthor(brick.brickUsers, user.id);

    if (!brick.space) {
      return isCreator || (!fullRight && isCoAuthor);
    }

    if (await this.spaceUserService.checkCurrentUserIsSpaceAdmin(brick.space.id)) {
      return true;
    }

    if (await this.spaceUserService.checkCurrentUserIsSpaceUser(brick.space.id)) {
      return isCreator || isCoAuthor;
    }

    return !fullRight && isCoAuthor;
  }

  async assertCanEdit(brick: HnBrick, user: HnUser, fullRight = true): Promise<void> {
    if (!(await this.canEdit(brick, user, fullRight))) {
      throw new BlUnauthorizedException('You are not authorized to perform this action');
    }
  }

  assertIsCreatorOrCoAuthor(brick: HnBrick, user: HnUser): void {
    this.communitySecurity.assertIsCreatorOrCoAuthor(brick, brick.brickUsers, user.id);
  }
}
