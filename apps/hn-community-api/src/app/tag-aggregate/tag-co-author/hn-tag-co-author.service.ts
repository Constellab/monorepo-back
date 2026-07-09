import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnTagCoAuthorInvite } from '../tag-co-author-invite/hn-tag-co-author-invite.entity';
import { HnTagCoAuthorInviteService } from '../tag-co-author-invite/hn-tag-co-author-invite.service';
import { HnTagKey } from '../tag-key/hn-tag-key.entity';
import { HnTagCoAuthor } from './hn-tag-co-author.entity';

@Injectable()
export class HnTagCoAuthorService {
  constructor(
    @InjectRepository(HnTagCoAuthor)
    private tagCoAuthorRepository: Repository<HnTagCoAuthor>,
    private readonly tagCoAuthorInviteService: HnTagCoAuthorInviteService
  ) {}

  async getTagCoAuthorsByTagKeyId(tagKeyId: string): Promise<HnTagCoAuthor[]> {
    return this.tagCoAuthorRepository.find({ where: { tagKey: { id: tagKeyId } } });
  }

  async getTagCoAuthorsByUserId(userId: string): Promise<HnTagCoAuthor[]> {
    return this.tagCoAuthorRepository.find({ where: { user: { id: userId } }, relations: { tagKey: true } });
  }

  async removeTagCoAuthor(tagKeyId: string, userId: string): Promise<void> {
    const tagCoAuthor: HnTagCoAuthor | null = await this.tagCoAuthorRepository.findOneBy({
      tagKey: { id: tagKeyId },
      user: { id: userId },
    });
    if (tagCoAuthor) {
      await this.tagCoAuthorRepository.remove(tagCoAuthor);
    }
  }

  async getTagCoAuthorInviteByToken(token: string): Promise<HnTagCoAuthorInvite | null> {
    return this.tagCoAuthorInviteService.getTagCoAuthorInviteByToken(token);
  }

  async acceptInvite(tagCoAuthor: HnTagCoAuthor, tagCoAuthorInvite: HnTagCoAuthorInvite): Promise<boolean> {
    return (
      (await this.tagCoAuthorInviteService.acceptUserInvite(tagCoAuthorInvite)) != null &&
      (await this.tagCoAuthorRepository.save(tagCoAuthor)) != null
    );
  }

  async getTagCoAuthorsInvites(tagKeyId: string): Promise<HnTagCoAuthorInvite[]> {
    return this.tagCoAuthorInviteService.getTagCoAuthorsInvites(tagKeyId);
  }

  async getTagCoAuthorsPendingInvites(tagKeyId: string): Promise<HnTagCoAuthorInvite[]> {
    return this.tagCoAuthorInviteService.getPendingUserInvitesWithUser(tagKeyId);
  }

  async inviteTagCoAuthor(tagKey: HnTagKey, emailOrId: string): Promise<boolean> {
    return this.tagCoAuthorInviteService.createUserInviteMail(tagKey, emailOrId);
  }

  async deleteCoAuthorInvite(inviteId: string): Promise<boolean> {
    return this.tagCoAuthorInviteService.deleteUserInvite(inviteId);
  }
}
