import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnUser } from '../../users/hn-user.entity';
import { HnCommunityAppEntity } from '../community-app/hn-community-app.entity';
import { HnCommunityAppUser } from './hn-community-app-user.entity';

@Injectable()
export class HnCommunityAppUserService {
  constructor(
    @InjectRepository(HnCommunityAppUser) private readonly appUserRepository: Repository<HnCommunityAppUser>
  ) {}

  createAppUser(app: HnCommunityAppEntity, user: HnUser): Promise<HnCommunityAppUser> {
    const appUser = new HnCommunityAppUser();
    appUser.initAppUser(app, user);
    return this.appUserRepository.save(appUser);
  }

  async checkAndRemoveAppUser(appId: string, appUserId: string): Promise<void> {
    const appUser: HnCommunityAppUser = await this.appUserRepository.findOneBy({
      app: { id: appId },
      user: { id: appUserId },
    });
    if (appUser) {
      await this.appUserRepository.remove(appUser);
    }
  }

  async getAppUsersByUser(user: HnUser): Promise<HnCommunityAppUser[]> {
    return this.appUserRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: { app: true },
    });
  }

  async getAppUsers(app: HnCommunityAppEntity): Promise<HnCommunityAppUser[]> {
    return this.appUserRepository.find({
      where: {
        app: {
          id: app.id,
        },
      },
      relations: { user: true },
    });
  }
}
