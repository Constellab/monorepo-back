import { Injectable } from '@nestjs/common';
import { HnAbstractCommentService } from '../comment-core/hn-abstract-comment.service';
import { HnTagKey } from '../../tag-aggregate/tag-key/hn-tag-key.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HnCommentTag } from './hn-comment-tag.entity';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HnTagKeyService } from '../../tag-aggregate/tag-key/hn-tag-key.service';
import { TeRichText } from '@monorepo/te-text-editor';

@Injectable()
export class HnCommentTagService extends HnAbstractCommentService<HnTagKey> {
  constructor(
    private tagKeyService: HnTagKeyService,
    @InjectRepository(HnCommentTag) commentTagRepository: Repository<HnCommentTag>,
    eventEmitter: EventEmitter2
  ) {
    super(commentTagRepository, eventEmitter);
  }

  async getEntityAndCheckRightsById(entityId: string): Promise<HnTagKey> {
    return this.tagKeyService.getTagKeyById(entityId);
  }

  getEntityClass(): typeof HnCommentTag {
    return HnCommentTag;
  }

  createComment(entity: HnTagKey, commentData: TeRichText): HnCommentTag {
    const comment: HnCommentTag = new HnCommentTag();
    comment.entityId = entity.id;
    comment.entity = entity;
    comment.setContentRichText(commentData);
    return comment;
  }
}
