import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';

import { HnCommunitySecurity } from '../../core/security/hn-community-security.service';
import { HnSpaceUserService } from '../../space-aggregate/space-user/hn-space-user.service';
import { HnUser } from '../../users/hn-user.entity';
import { HnBrick } from '../brick/hn-brick.entity';
import { HnBrickUserService } from '../brick-user/hn-brick-user.service';

@Injectable()
export class HnBrickSecurity {
  constructor(
    private communitySecurity: HnCommunitySecurity,
    private spaceUserService: HnSpaceUserService,
    private brickUserService: HnBrickUserService
  ) {}

  async canEdit(brick: HnBrick, user: HnUser, fullRight = true): Promise<boolean> {
    if (!user) return false;
    // if (user.isAdmin()) return true;

    const isCreator = this.communitySecurity.isCreator(brick, user.id);
    const brickUsers = await this.brickUserService.getBrickUsers(brick);
    const isCoAuthor = this.communitySecurity.isCoAuthor(brickUsers, user.id);

    if (!brick.space) {
      return isCreator || (!fullRight && isCoAuthor);
    }

    if (await this.spaceUserService.checkCurrentUserIsSpaceAdmin(brick.space.id)) {
      return true;
    }

    if (await this.spaceUserService.checkCurrentUserIsSpaceUser(brick.space.id)) {
      return isCreator || (!fullRight && isCoAuthor);
    }

    return false;
  }

  async assertCanEdit(brick: HnBrick, user: HnUser, fullRight = true): Promise<void> {
    if (!(await this.canEdit(brick, user, fullRight))) {
      throw new BlUnauthorizedException('You are not authorized to perform this action');
    }
  }

  async assertIsCreatorOrCoAuthor(brick: HnBrick, user: HnUser): Promise<void> {
    const brickUsers = await this.brickUserService.getBrickUsers(brick);
    this.communitySecurity.assertIsCreatorOrCoAuthor(brick, brickUsers, user.id);
  }
}
