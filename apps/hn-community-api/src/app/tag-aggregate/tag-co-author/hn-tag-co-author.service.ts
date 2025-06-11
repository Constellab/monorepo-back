import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HnTagCoAuthor } from './hn-tag-co-author.entity';
import { Repository } from 'typeorm';
import { HnTagCoAuthorInviteService } from '../tag-co-author-invite/hn-tag-co-author-invite.service';
import { HnTagCoAuthorInvite } from '../tag-co-author-invite/hn-tag-co-author-invite.entity';
import { HnTagKey } from '../tag-key/hn-tag-key.entity';

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
    return this.tagCoAuthorRepository.find({ where: { user: { id: userId } }, relations: ['tagKey'] });
  }

  async removeTagCoAuthor(tagKeyId: string, userId: string): Promise<void> {
    const tagCoAuthor: HnTagCoAuthor = await this.tagCoAuthorRepository.findOneBy({
      tagKey: { id: tagKeyId },
      user: { id: userId },
    });
    if (tagCoAuthor) {
      await this.tagCoAuthorRepository.remove(tagCoAuthor);
    }
  }

  async getTagCoAuthorInviteByToken(token: string): Promise<HnTagCoAuthorInvite> {
    return this.tagCoAuthorInviteService.getTagCoAuthorInviteByToken(token);
  }

  async acceptInvite(tagCoAuthor: HnTagCoAuthor, tagCoAuthorInvite: HnTagCoAuthorInvite): Promise<boolean> {
    return (
      (await this.tagCoAuthorInviteService.acceptInvite(tagCoAuthorInvite)) != null &&
      (await this.tagCoAuthorRepository.save(tagCoAuthor)) != null
    );
  }

  async getTagCoAuthorsInvites(tagKeyId: string): Promise<HnTagCoAuthorInvite[]> {
    return this.tagCoAuthorInviteService.getTagCoAuthorsInvites(tagKeyId);
  }

  async getTagCoAuthorsPendingInvites(tagKeyId: string): Promise<HnTagCoAuthorInvite[]> {
    return this.tagCoAuthorInviteService.getTagCoAuthorsPendingInvites(tagKeyId);
  }

  async inviteTagCoAuthor(tagKey: HnTagKey, coAuthorMail: string): Promise<boolean> {
    return this.tagCoAuthorInviteService.createTagCoAuthorMail(tagKey, coAuthorMail);
  }

  async deleteCoAuthorInvite(inviteId: string): Promise<boolean> {
    return this.tagCoAuthorInviteService.deleteCoAuthorInvite(inviteId);
  }
}
