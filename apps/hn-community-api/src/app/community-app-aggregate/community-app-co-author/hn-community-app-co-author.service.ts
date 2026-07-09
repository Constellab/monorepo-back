import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnCommunityApp } from '../community-app/hn-community-app.entity';
import { HnCommunityAppCoAuthorInvite } from '../community-app-co-author-invite/hn-community-app-co-author-invite.entity';
import { HnCommunityAppCoAuthorInviteService } from '../community-app-co-author-invite/hn-community-app-co-author-invite.service';
import { HnCommunityAppCoAuthor } from './hn-community-app-co-author.entity';

@Injectable()
export class HnCommunityAppCoAuthorService {
  constructor(
    @InjectRepository(HnCommunityAppCoAuthor)
    private communityAppCoAuthorRepository: Repository<HnCommunityAppCoAuthor>,
    private communityAppCoAuthorInviteService: HnCommunityAppCoAuthorInviteService
  ) {}

  async getCommunityAppCoAuthorsByCommunityAppId(communityAppId: string): Promise<HnCommunityAppCoAuthor[]> {
    return this.communityAppCoAuthorRepository.find({ where: { communityApp: { id: communityAppId } } });
  }

  async getCommunityAppCoAuthorsByUserId(userId: string): Promise<HnCommunityAppCoAuthor[]> {
    return this.communityAppCoAuthorRepository.find({
      where: { user: { id: userId } },
      relations: { communityApp: true },
    });
  }

  async removeCommunityAppCoAuthor(
    communityAppId: string,
    communityAppCoAuthorUserId: string
  ): Promise<void> {
    const communityAppCoAuthor: HnCommunityAppCoAuthor | null = await this.communityAppCoAuthorRepository.findOneBy({
      communityApp: { id: communityAppId },
      user: { id: communityAppCoAuthorUserId },
    });
    if (communityAppCoAuthor) {
      await this.communityAppCoAuthorRepository.remove(communityAppCoAuthor);
    }
  }

  getCommunityAppCoAuthorInviteByToken(token: string): Promise<HnCommunityAppCoAuthorInvite> {
    return this.communityAppCoAuthorInviteService.getAndCheckInvite(token);
  }

  async acceptInvite(
    communityAppCoAuthor: HnCommunityAppCoAuthor,
    communityAppCoAuthorInvite: HnCommunityAppCoAuthorInvite
  ): Promise<boolean> {
    return (
      (await this.communityAppCoAuthorInviteService.acceptUserInvite(communityAppCoAuthorInvite)) != null &&
      (await this.communityAppCoAuthorRepository.save(communityAppCoAuthor)) != null
    );
  }

  getCommunityAppCoAuthorsPendingInvites(communityAppId: string): Promise<HnCommunityAppCoAuthorInvite[]> {
    return this.communityAppCoAuthorInviteService.getPendingUserInvitesWithUser(communityAppId);
  }

  inviteCommunityAppCoAuthor(communityApp: HnCommunityApp, emailOrId: string): Promise<boolean> {
    return this.communityAppCoAuthorInviteService.createUserInviteMail(communityApp, emailOrId);
  }

  deleteCoAuthorInvite(inviteId: string): Promise<boolean> {
    return this.communityAppCoAuthorInviteService.deleteUserInvite(inviteId);
  }
}
