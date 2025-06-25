import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
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

  public checkIsSpaceAdmin(spaceId: string, user: CnUser): void {
    if (this.isAdmin(user)) return;

    if (!this.isSpaceAdmin(spaceId, user.id)) {
      throw new BlUnauthorizedException();
    }
  }

  public async checkIsSpaceMember(spaceId: string, user: CnUser): Promise<void> {
    if (this.isAdmin(user)) return;

    await this.getAndCheckSpaceUser(spaceId, user.id);
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
