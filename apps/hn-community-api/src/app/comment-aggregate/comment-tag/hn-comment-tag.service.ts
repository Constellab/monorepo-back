import { TeRichText } from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnTagKey } from '../../tag-aggregate/tag-key/hn-tag-key.entity';
import { HnTagKeyService } from '../../tag-aggregate/tag-key/hn-tag-key.service';
import { HnAbstractCommentService } from '../comment-core/hn-abstract-comment.service';
import { HnCommentTag } from './hn-comment-tag.entity';

@Injectable()
export class HnCommentTagService extends HnAbstractCommentService<HnTagKey> {
  constructor(
    private tagKeyService: HnTagKeyService,
    @InjectRepository(HnCommentTag) commentTagRepository: Repository<HnCommentTag>,
    eventEmitter: EventEmitter2
  ) {
    super(commentTagRepository, eventEmitter);
  }

  async getEntityByIdAndCheck(entityId: string): Promise<HnTagKey> {
    const tagKey = await this.tagKeyService.getTagKeyById(entityId);
    if (!tagKey) {
      throw new Error(`TagKey with id ${entityId} not found`);
    }
    return tagKey;
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
