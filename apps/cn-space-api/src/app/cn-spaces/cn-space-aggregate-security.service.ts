import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';

import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnSpaceUser } from './cn-space-user.entity';
import { CnSpaceUserService } from './cn-space-user.service';

@Injectable()
export class CnSpaceAggregateSecurity {
  constructor(private spaceUserService: CnSpaceUserService) {}

  public checkIsAdmin(user: CnUser): void {
    if (!this.isAdmin(user)) {
      throw new BlUnauthorizedException();
    }
  }

  public async checkIsSpaceAdmin(spaceId: string, user: CnUser): Promise<void> {
    if (this.isAdmin(user)) return;

    const isSpaceAdmin = await this.isSpaceAdmin(spaceId, user.id);
    if (!isSpaceAdmin) {
      throw new BlUnauthorizedException();
    }
  }

  public async checkIsSpaceUser(spaceId: string, user: CnUser): Promise<void> {
    if (this.isAdmin(user)) return;

    await this.getAndCheckSpaceUser(spaceId, user.id);
  }

  public async checkIsSpaceUserOrAbove(spaceId: string, user: CnUser): Promise<void> {
    if (this.isAdmin(user)) return;

    const spaceUser = await this.getAndCheckSpaceUser(spaceId, user.id);
    if (spaceUser.isSpaceViewer()) {
      throw new BlUnauthorizedException(CnErrorText.VISITOR_CANNOT_ACCESS_RESOURCE);
    }
  }

  private async isSpaceAdmin(spaceId: string, userId: string): Promise<boolean> {
    const spaceUser = await this.getAndCheckSpaceUser(spaceId, userId);
    return spaceUser.isSpaceAdmin();
  }

  private async getAndCheckSpaceUser(spaceId: string, userId: string): Promise<CnSpaceUser> {
    const spaceUser = await this.spaceUserService.findOneBySpaceIdAndUserId(spaceId, userId);
    if (!spaceUser) {
      throw new BlUnauthorizedException();
    }
    return spaceUser;
  }

  private isAdmin(user: CnUser): boolean {
    return user.isAdmin();
  }
}
